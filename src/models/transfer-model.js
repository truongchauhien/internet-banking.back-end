import { pool_query, doTransaction } from '../modules/database/mysql-db.js';
import TRANSFER_STATUS from './constants/transfer-status.js';
import TRANSACTION_TYPES from './constants/transaction-types.js';
import FEES from './constants/fees.js';
import CURRENCIES from './constants/currencies.js';
import TransactionCanceled from './extensions/transaction-canceled.js';
import TRANSFER_TYPES from './constants/transfer-types.js';
import DEBT_STATUS from './constants/debt-status.js';

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
        const exchangRate = results[0].exchangeRate;

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
            fromBankId: null,
            toBankId: null,
            fromCurrencyId: fromAccount.currencyId,
            toCurrencyId: toAccount.currencyId,
            fromAmount: amount,
            toAmount: amount * exchangRate,
            fromFee,
            toFee,
            message,
            otp,
            otpAttempts: 0,
            statusId: TRANSFER_STATUS.OTP_PENDING,
            typeId: TRANSFER_TYPES.INTRABANK_TRANSFER
        };
        [results] = await connection.query('INSERT INTO transfers SET ?', [transfer]);

        return {
            id: results.insertId,
            ...transfer
        };
    });
};

export const createInterbankTransfer = ({ customerId, fromAccountNumber, toAccountNumber, toBankId, amount, whoPayFee, message, otp }) => {
    return doTransaction(async (connection) => {
        let results;
        [results] = await connection.query('SELECT * FROM fees WHERE id = ?', [FEES.INTER_BANK_TRANSFER]);
        const fee = results[0];

        let feeAmount = fee.amount;
        if (whoPayFee === 'beneficiary') {
            feeAmount = -feeAmount;
        }

        const transfer = {
            customerId,
            fromAccountNumber,
            toAccountNumber,
            toBankId: toBankId,
            amount,
            fee: feeAmount,
            currencyId: CURRENCIES.vnd,
            message,
            otp,
            statusId: TRANSFER_STATUS.OTP_PENDING,
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
        const exchangRate = results[0].exchangeRate;
        
        [results] = await connection.query('SELECT * FROM fees WHERE id = ?', [FEES.INTRA_BANK_TRANSFER]);
        const fee = results[0];
        [results] = await connection.query('SELECT exchangeRate FROM exchange_rates WHERE fromCurrencyId = ? AND toCurrencyId = ? AND fromDate <= ? AND ? < toDate ',
            [fromAccount.currencyId, fee.currencyId, currentDate, currentDate]
        );
        const feeExchangRate = results[0].exchangeRate;
        let fromFee = fee.amount * feeExchangRate;

        const transfer = {
            fromCustomerId: fromAccount.customerId,
            toCustomerId: toAccount.customerId,
            fromAccountNumber,
            toAccountNumber,
            fromBankId: null,
            toBankId: null,
            fromCurrencyId: fromAccount.currencyId,
            toCurrencyId: toAccount.currencyId,
            fromAmount: amount,
            toAmount: amount * exchangRate,
            fromFee: fromFee,
            toFee: 0,
            message,
            otp,
            otpAttempts: 0,
            statusId: TRANSFER_STATUS.OTP_PENDING,
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

        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.fromAccountNumber]);
        const fromAccount = results[0];

        if (!transfer) throw new TransactionCanceled();
        if (!transfer.bankId) throw new TransactionCanceled();

        let minimumBalance = transfer.amount;
        if (transfer.fee > 0) {
            minimumBalance += transfer.fee;
        } else {
            if (transfer.amount <= Math.abs(transfer.fee)) throw new TransactionCanceled();
        }
        if (fromAccount.balance < minimumBalance) throw new TransactionCanceled();

        if (transfer.fee > 0) {
            [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
                fromAccount.balance - (transfer.amount + transfer.fee),
                fromAccount.id
            ]);

            [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
                [fromAccount.id, -transfer.amount, CURRENCIES.vnd, TRANSACTION_TYPES.INTERBANK_TRANSFER],
                [fromAccount.id, -transfer.fee, CURRENCIES.vnd, TRANSACTION_TYPES.INTERBANK_TRANSFER_FEE]
            ]]);
        } else if (transfer.fee < 0) {
            [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
                fromAccount.balance - (transfer.amount - Math.abs(transfer.fee)),
                fromAccount.id
            ]);

            [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
                [fromAccount.id, -(transfer.amount - Math.abs(transfer.fee)), CURRENCIES.vnd, TRANSACTION_TYPES.INTERBANK_TRANSFER],
                [fromAccount.id, -Math.abs(transfer.fee), CURRENCIES.vnd, TRANSACTION_TYPES.INTERBANK_TRANSFER_FEE]
            ]]);
        } else {
            [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
                fromAccount.balance - transfer.amount,
                fromAccount.id
            ]);

            [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
                [fromAccount.id, -transfer.amount, CURRENCIES.vnd, TRANSACTION_TYPES.INTERBANK_TRANSFER]
            ]]);
        }

        [results] = await connection.query('UPDATE transfers SET statusId = ? WHERE id = ?', [TRANSFER_STATUS.COMFIRMED, transferId]);
    });
};

export const confirmPayDebtTransfer = (transferId) => {
    return doTransaction(async (connection) => {
        let results;
        [results] = await connection.query('SELECT * FROM transfers WHERE id = ?', transferId);
        const transfer = results[0];

        if (transfer.typeId !== TRANSFER_TYPES.PAY_DEBT_TRANSFER) {
            throw new TransactionCanceled();
        }

        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.fromAccountNumber]);
        const fromAccount = results[0];
        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.toAccountNumber]);
        const toAccount = results[0];

        let minimumBalance = transfer.amount + transfer.fee;
        if (fromAccount.balance < minimumBalance) throw new TransactionCanceled();

        [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
            fromAccount.balance - (transfer.amount + transfer.fee),
            fromAccount.id
        ]);
        [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
            toAccount.balance + transfer.amount,
            toAccount.id
        ]);

        [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
            [fromAccount.id, -transfer.amount, CURRENCIES.vnd, TRANSACTION_TYPES.PAY_DEBT_TRANSFER],
            [fromAccount.id, -transfer.fee, CURRENCIES.vnd, TRANSACTION_TYPES.INTRABANK_TRANSFER_FEE],
            [toAccount.id, transfer.amount, CURRENCIES.vnd, TRANSACTION_TYPES.PAY_DEBT_RECEIVE]
        ]]);

        [results] = await connection.query('UPDATE transfers SET statusId = ? WHERE id = ?', [TRANSFER_STATUS.COMFIRMED, transfer.id]);

        [results] = await connection.query('UPDATE debts SET statusId = ? WHERE transferId = ?', [DEBT_STATUS.PAID, transfer.id]);
    });
};

export const makeTransferExpired = async (transferId) => {
    await pool_query('UPDATE transfers SET statusId = ? WHERE id = ?', TRANSFER_STATUS.OTP_OVERTIME, transferId);
};

export const makeTransferCanceled = async (transferId) => {
    await pool_query('UPDATE transfers SET statusId = ? WHERE id = ?', TRANSFER_STATUS.CANCELED);
};

export const makeTransferRejected = async (transferId) => {
    await pool_query('UPDATE transfers SET statusId = ? WHERE id = ?', TRANSFER_STATUS.REJECTED);
};
