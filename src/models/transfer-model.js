import { pool_query, doTransaction } from '../modules/database/mysql-db.js';
import TRANSFER_STATUS from './constants/transfer-status.js';
import TRANSACTION_TYPES from './constants/transaction-types.js';
import FEES from './constants/fees.js';
import CURRENCIES from './constants/currencies.js';
import TransactionCanceled from './extensions/transaction-canceled.js';
import TRANSFER_TYPES from './constants/transfer-types.js';
import DEBT_STATUS from './constants/debt-status.js';
import BANKS from './constants/banks.js';

export const getTransferById = async (transferId) => {
    const [results] = await pool_query('SELECT * FROM transfers WHERE id = ?', [transferId]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0]
    };

    return null;
};

export const createIntrabankTransfer = ({ fromAccountNumber, toAccountNumber, amount, whoPayFee, message, otp }) => {
    return doTransaction(async (connection) => {
        const currentDate = new Date();

        let results;
        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [fromAccountNumber]);
        const fromAccount = results[0];
        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [toAccountNumber]);
        const toAccount = results[0];
        [results] = await connection.query(
            'SELECT exchangeRate ' +
            'FROM exchange_rates ' +
            'WHERE fromCurrencyId = ? AND toCurrencyId = ? ' +
            '    AND fromDate <= ? AND ? < toDate ',
            [fromAccount.currencyId, toAccount.currencyId, currentDate, currentDate]
        );
        const exchangeRate = results[0].exchangeRate;

        [results] = await connection.query('SELECT * FROM fees WHERE id = ?', [FEES.INTRA_BANK_TRANSFER]);
        const fee = results[0];
        let fromFee = 0;
        let toFee = 0;
        if (whoPayFee === 'sender') {
            [results] = await connection.query(
                'SELECT exchangeRate ' +
                'FROM exchange_rates ' +
                'WHERE fromCurrencyId = ? AND toCurrencyId = ? ' +
                '    AND fromDate <= ? AND ? < toDate ',
                [fromAccount.currencyId, fee.currencyId, currentDate, currentDate]
            );
            const feeExchangeRate = results[0].exchangeRate;

            fromFee = fee.amount * feeExchangeRate;
            toFee = 0;
        }
        if (whoPayFee === 'beneficiary') {
            [results] = await connection.query(
                'SELECT exchangeRate ' +
                'FROM exchange_rates ' +
                'WHERE fromCurrencyId = ? AND toCurrencyId = ? ' +
                '    AND fromDate <= ? AND ? < toDate ',
                [toAccount.currencyId, fee.currencyId, currentDate, currentDate]
            );
            const feeExchangeRate = results[0].exchangeRate;

            fromFee = 0;
            toFee = fee.amount * feeExchangeRate;
        }

        const transfer = {
            fromCustomerId: fromAccount.customerId,
            toCustomerId: toAccount.customerId,
            fromAccountNumber,
            toAccountNumber,
            fromBankId: BANKS.INTERNAL,
            toBankId: BANKS.INTERNAL,
            fromCurrencyId: fromAccount.currencyId,
            toCurrencyId: toAccount.currencyId,
            fromAmount: amount,
            toAmount: amount * exchangeRate,
            fromFee,
            toFee,
            message,
            otp,
            otpAttempts: 0,
            statusId: TRANSFER_STATUS.PENDING_CONFIRMATION,
            typeId: TRANSFER_TYPES.INTRABANK_TRANSFER
        };
        [results] = await connection.query('INSERT INTO transfers SET ?', [transfer]);

        return {
            id: results.insertId,
            ...transfer
        };
    });
};

export const createInterbankTransfer = ({ fromAccountNumber, toAccountNumber, toBankId, amount, currencyId, whoPayFee, message, otp }) => {
    return doTransaction(async (connection) => {
        const currentDate = new Date();

        let results;
        [results] = await connection.query('SELECT customerId, currencyId FROM accounts WHERE accountNumber = ?', [fromAccountNumber]);
        const fromAccount = results[0];
        [results] = await connection.query('SELECT exchangeRate FROM exchange_rates WHERE fromCurrencyId = ? AND toCurrencyId = ? AND fromDate <= ? AND ? < toDate ',
            [fromAccount.currencyId, CURRENCIES.VND, currentDate, currentDate]
        );
        const exchangeRate = results[0].exchangeRate;
        const fromAmount = amount;
        const toAmount = amount * exchangeRate;

        let fromFee = 0;
        let toFee = 0;
        [results] = await connection.query('SELECT * FROM fees WHERE id = ?', [FEES.INTER_BANK_TRANSFER]);
        const fee = results[0];
        if (whoPayFee === 'sender') {
            [results] = await connection.query('SELECT exchangeRate FROM exchange_rates WHERE fromCurrencyId = ? AND toCurrencyId = ? AND fromDate <= ? AND ? < toDate ',
                [fromAccount.currencyId, fee.currencyId, currentDate, currentDate]
            );
            const feeExchangeRate = results[0].exchangeRate;

            fromFee = fee.amount * feeExchangeRate;
            toFee = 0;
        }
        if (whoPayFee === 'beneficiary') {
            [results] = await connection.query('SELECT exchangeRate FROM exchange_rates WHERE fromCurrencyId = ? AND toCurrencyId = ? AND fromDate <= ? AND ? < toDate ',
                [CURRENCIES.VND, fee.currencyId, currentDate, currentDate]
            );
            const feeExchangeRate = results[0].exchangeRate;
            fromFee = 0;
            toFee = fee.amount * feeExchangeRate;
        }

        const transfer = {
            fromCustomerId: fromAccount.customerId,
            toCustomerId: null,
            fromAccountNumber,
            toAccountNumber,
            fromBankId: BANKS.INTERNAL,
            toBankId: toBankId,
            fromCurrencyId: fromAccount.currencyId,
            toCurrencyId: CURRENCIES.VND,
            fromAmount,
            toAmount,
            fromFee,
            toFee,
            message,
            otp,
            otpAttempts: 0,
            statusId: TRANSFER_STATUS.PENDING_CONFIRMATION,
            typeId: TRANSFER_TYPES.INTERBANK_TRANSFER
        };
        [results] = await connection.query('INSERT INTO transfers SET ?', [transfer]);

        return {
            id: results.insertId,
            ...transfer
        };
    });
};

export const createPayDebtTransfer = ({ debtId, fromAccountNumber, toAccountNumber, amount, message, otp }) => {
    return doTransaction(async (connection) => {
        const currentDate = new Date();

        let results;
        [results] = await connection.query('SELECT customerId, currencyId FROM accounts WHERE accountNumber = ?', [fromAccountNumber]);
        const fromAccount = results[0];
        [results] = await connection.query('SELECT customerId, currencyId FROM accounts WHERE accountNumber = ?', [toAccountNumber]);
        const toAccount = results[0];

        [results] = await connection.query('SELECT exchangeRate FROM exchange_rates WHERE fromCurrencyId = ? AND toCurrencyId = ? AND fromDate <= ? AND ? < toDate ',
            [fromAccount.currencyId, toAccount.currencyId, currentDate, currentDate]
        );
        const exchangeRate = results[0].exchangeRate;

        [results] = await connection.query('SELECT * FROM fees WHERE id = ?', [FEES.INTRA_BANK_TRANSFER]);
        const fee = results[0];
        [results] = await connection.query('SELECT exchangeRate FROM exchange_rates WHERE fromCurrencyId = ? AND toCurrencyId = ? AND fromDate <= ? AND ? < toDate ',
            [fromAccount.currencyId, fee.currencyId, currentDate, currentDate]
        );
        const feeExchangeRate = results[0].exchangeRate;
        let fromFee = fee.amount * feeExchangeRate;

        const transfer = {
            fromCustomerId: fromAccount.customerId,
            toCustomerId: toAccount.customerId,
            fromAccountNumber,
            toAccountNumber,
            fromBankId: BANKS.INTERNAL,
            toBankId: BANKS.INTERNAL,
            fromCurrencyId: fromAccount.currencyId,
            toCurrencyId: toAccount.currencyId,
            fromAmount: amount,
            toAmount: amount * exchangeRate,
            fromFee: fromFee,
            toFee: 0,
            message,
            otp,
            otpAttempts: 0,
            statusId: TRANSFER_STATUS.PENDING_CONFIRMATION,
            typeId: TRANSFER_TYPES.PAY_DEBT_TRANSFER
        };
        [results] = await connection.query('INSERT INTO transfers SET ?', [transfer]);

        const transferId = results.insertId;
        await connection.query('UPDATE debts SET transferId = ? WHERE id = ?', [transferId, debtId])

        return {
            id: transferId,
            ...transfer
        };
    });
};

export const confirmIntraBankTransfer = (transferId) => {
    return doTransaction(async (connection) => {
        let results;

        // Get transfer.
        [results] = await connection.query('SELECT * FROM transfers WHERE id = ?', [transferId]);
        const transfer = results[0];
        if (transfer.typeId !== TRANSFER_TYPES.INTRABANK_TRANSFER) {
            throw new TransactionCanceled();
        }

        // Get sender account.
        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.fromAccountNumber]);
        const fromAccount = results[0];
        // Get beneficiary account.
        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.toAccountNumber]);
        const toAccount = results[0];

        // Check sender balance.
        let senderLowerBoundBalance = transfer.fromAmount + transfer.fromFee;
        if (fromAccount.balance < senderLowerBoundBalance) throw new TransactionCanceled();

        [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
            fromAccount.balance - transfer.fromAmount - transfer.fromFee,
            fromAccount.id
        ]);
        [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
            toAccount.balance + transfer.toAmount - transfer.toFee,
            toAccount.id
        ]);

        [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
            [fromAccount.id, -transfer.fromAmount, fromAccount.currencyId, TRANSACTION_TYPES.INTRABANK_TRANSFER],
            [toAccount.id, transfer.toAmount, toAccount.currencyId, TRANSACTION_TYPES.INTRABANK_RECEIVE]
        ]]);

        if (transfer.fromFee > 0) {
            [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
                [fromAccount.id, -transfer.fromFee, fromAccount.currencyId, TRANSACTION_TYPES.INTRABANK_TRANSFER_FEE]
            ]]);
        }

        if (transfer.toFee > 0) {
            [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
                [toAccount.id, -transfer.toFee, toAccount.currencyId, TRANSACTION_TYPES.INTRABANK_TRANSFER_FEE]
            ]]);
        }

        [results] = await connection.query('UPDATE transfers SET statusId = ?, comfirmedAt = CURRENT_TIMESTAMP WHERE id = ?', [TRANSFER_STATUS.COMFIRMED, transferId]);
    });
};

export const confirmInterBankTransfer = (transferId) => {
    return doTransaction(async (connection) => {
        let results;

        [results] = await connection.query('SELECT * FROM transfers WHERE id = ?', [transferId]);
        const transfer = results[0];
        if (transfer.typeId !== TRANSFER_TYPES.INTERBANK_TRANSFER) throw new TransactionCanceled();

        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.fromAccountNumber]);
        const fromAccount = results[0];

        // Check sender balance.
        let senderLowerBoundBalance = transfer.fromAmount + transfer.fromFee;
        if (fromAccount.balance < senderLowerBoundBalance) throw new TransactionCanceled();

        // Check if beneficiary can pay for transfer fee.
        if (transfer.toAmount - transfer.toFee <= 0) throw new TransactionCanceled();

        [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
            fromAccount.balance - transfer.fromAmount - transfer.fromFee,
            fromAccount.id
        ]);

        [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
            [fromAccount.id, -transfer.fromAmount, fromAccount.currencyId, TRANSACTION_TYPES.INTERBANK_TRANSFER]
        ]]);

        if (transfer.fromFee > 0) {
            [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
                [fromAccount.id, -transfer.fromFee, fromAccount.currencyId, TRANSACTION_TYPES.INTERBANK_TRANSFER_FEE]
            ]]);
        }

        [results] = await connection.query('UPDATE transfers SET statusId = ?, comfirmedAt = CURRENT_TIMESTAMP WHERE id = ?', [TRANSFER_STATUS.COMFIRMED, transferId]);
    });
};

export const confirmPayDebtTransfer = (transferId) => {
    return doTransaction(async (connection) => {
        let results;

        // Get transfer.
        [results] = await connection.query('SELECT * FROM transfers WHERE id = ?', transferId);
        const transfer = results[0];
        if (transfer.typeId !== TRANSFER_TYPES.PAY_DEBT_TRANSFER) {
            throw new TransactionCanceled();
        }

        // Get sender account.
        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.fromAccountNumber]);
        const fromAccount = results[0];
        // Get beneficiary account.
        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.toAccountNumber]);
        const toAccount = results[0];

        // Check sender balance.
        let senderLowerBoundBalance = transfer.fromAmount + transfer.fromFee;
        if (fromAccount.balance < senderLowerBoundBalance) throw new TransactionCanceled();

        [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
            fromAccount.balance - transfer.fromAmount - transfer.fromFee,
            fromAccount.id
        ]);
        [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
            toAccount.balance + transfer.toAmount, // toFee = 0.
            toAccount.id
        ]);

        [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
            [fromAccount.id, -transfer.fromAmount, fromAccount.currencyId, TRANSACTION_TYPES.PAY_DEBT_TRANSFER],
            [toAccount.id, transfer.toAmount, toAccount.currencyId, TRANSACTION_TYPES.PAY_DEBT_RECEIVE]
        ]]);

        if (transfer.fromFee > 0) {
            [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
                [fromAccount.id, -transfer.fromFee, fromAccount.currencyId, TRANSACTION_TYPES.INTRABANK_TRANSFER_FEE]
            ]]);
        }

        [results] = await connection.query('UPDATE transfers SET statusId = ?, comfirmedAt = CURRENT_TIMESTAMP WHERE id = ?', [TRANSFER_STATUS.COMFIRMED, transfer.id]);
        [results] = await connection.query('UPDATE debts SET statusId = ? WHERE transferId = ?', [DEBT_STATUS.PAID, transfer.id]);
    });
};

export const makeTransferExpired = async (transferId) => {
    await pool_query('UPDATE transfers SET statusId = ? WHERE id = ?', [TRANSFER_STATUS.OVERTIME, transferId]);
};

export const makeTransferCanceledBySender = async (transferId) => {
    await pool_query('UPDATE transfers SET statusId = ? WHERE id = ?', [TRANSFER_STATUS.CANCELED, transferId]);
};

export const makeTransferRejectedByTargetBank = async (transferId) => {
    await pool_query('UPDATE transfers SET statusId = ? WHERE id = ?', [TRANSFER_STATUS.REJECTED_BY_TARGET_BANK, transferId]);
};

export const createIncomingInterbankTransfer = ({ fromAccountNumber, fromBankId, toAccountNumber, amount, currencyId, message }) => {
    return doTransaction(async (connection) => {
        const currentDate = new Date();

        let results;
        [results] = await connection.query('SELECT id, customerId, currencyId, balance FROM accounts WHERE accountNumber = ?', [toAccountNumber]);
        const toAccount = results[0];
        [results] = await await connection.query('SELECT exchangeRate FROM exchange_rates WHERE fromCurrencyId = ? AND toCurrencyId = ? AND fromDate <= ? AND ? < toDate ',
            [currencyId, toAccount.currencyId, currentDate, currentDate]
        );
        const exchangeRate = results[0].exchangeRate;
        const fromAmount = amount;
        const toAmount = amount * exchangeRate;

        const transfer = {
            fromCustomerId: null,
            toCustomerId: toAccount.customerId,
            fromAccountNumber,
            toAccountNumber,
            fromBankId: fromBankId,
            toBankId: BANKS.INTERNAL,
            fromCurrencyId: currencyId,
            toCurrencyId: toAccount.currencyId,
            fromAmount: fromAmount,
            toAmount: toAmount,
            fromFee: 0,
            toFee: 0,
            message,
            otp: null,
            otpAttempts: null,
            statusId: TRANSFER_STATUS.PENDING_CONFIRMATION,
            typeId: TRANSFER_TYPES.INTERBANK_TRANSFER
        };

        [results] = await connection.query('INSERT INTO transfers SET ?', [transfer]);
        const transferId = results.insertId;

        [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
            toAccount.balance + transfer.toAmount,
            toAccount.id
        ]);

        [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
            [toAccount.id, transfer.toAmount, toAccount.currencyId, TRANSACTION_TYPES.INTERBANK_RECEIVE]
        ]]);

        [results] = await connection.query('UPDATE transfers SET statusId = ?, comfirmedAt = ? WHERE id = ?', [TRANSFER_STATUS.COMFIRMED, currentDate, transferId]);
    });
};
