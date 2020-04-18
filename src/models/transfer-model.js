import { pool_query, doTransaction } from '../database/mysql-db.js';
import TRANSFER_STATUS from './constants/transfer-status.js';
import TRANSACTION_TYPES from './constants/transaction-types.js';
import FEES from './constants/fees.js';
import CURRENCIES from './constants/currencies.js';
import TransactionCanceled from './extensions/transaction-canceled.js';
import TRANSFER_TYPES from './constants/transfer-types.js';
import DEBT_STATUS from './constants/debt-status.js';

export const createIntrabankTransfer = ({ customerId, fromAccountNumber, toAccountNumber, amount, whoPayFee, message, otp }) => {
    return doTransaction(async (connection) => {
        let results;
        [results] = await connection.query('SELECT * FROM fees WHERE id = ?', [FEES.INTRA_BANK_TRANSFER]);
        const fee = results[0];

        let feeAmount = fee.amount;
        if (whoPayFee === 'beneficiary') {
            feeAmount = -feeAmount;
        }

        const transfer = {
            customerId,
            fromAccountNumber,
            toAccountNumber,
            amount,
            fee: feeAmount,
            currencyId: CURRENCIES.vnd,
            message,
            otp,
            statusId: TRANSFER_STATUS.OTP_PENDING
        };
        [results] = await connection.query('INSERT INTO transfers SET ?', [transfer]);

        return {
            id: results.insertId,
            ...transfer
        };
    });
};

export const createPayDebtTransfer = ({ customerId, fromAccountNumber, toAccountNumber, amount, message, otp }) => {
    return doTransaction(async (connection) => {
        let results;
        [results] = await connection.query('SELECT * FROM fees WHERE id = ?', [FEES.INTRA_BANK_TRANSFER]);
        const fee = results[0];

        const transfer = {
            customerId,
            fromAccountNumber,
            toAccountNumber,
            amount,
            fee: fee.amount,
            currencyId: CURRENCIES.vnd,
            message,
            otp,
            statusId: TRANSFER_STATUS.OTP_PENDING,
            typeId: TRANSFER_TYPES.PAY_DEBT_TRANSFER
    };
        [results] = await connection.query('INSERT INTO transfers SET ?', [transfer]);

        return {
            id: results.insertId,
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

        // Get sender account.
        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.fromAccountNumber]);
        const fromAccount = results[0];

        // Get beneficiary account.
        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [transfer.toAccountNumber]);
        const toAccount = results[0];

        if (transfer.bankId) throw new TransactionCanceled();

        // Check balance.
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
            [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
                toAccount.balance + transfer.amount,
                toAccount.id
            ]);

            [results] = await connection.query('INSERT INTO transactions (accountId, amount, typeId) VALUES ?', [[
                [fromAccount.id, -transfer.amount, TRANSACTION_TYPES.INTRABANK_TRANSFER],
                [fromAccount.id, -transfer.fee, TRANSACTION_TYPES.INTRABANK_TRANSFER_FEE],
                [toAccount.id, transfer.amount, TRANSACTION_TYPES.INTRABANK_RECEIVE]
            ]]);
        } else if (transfer.fee < 0) {
            [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
                fromAccount.balance - transfer.amount,
                fromAccount.id
            ]);
            [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
                toAccount.balance + (transfer.amount - Math.abs(transfer.fee)),
                toAccount.id
            ]);

            [results] = await connection.query('INSERT INTO transactions (accountId, amount, typeId) VALUES ?', [[
                [fromAccount.id, -transfer.amount, TRANSACTION_TYPES.INTRABANK_TRANSFER],
                [toAccount.id, -Math.abs(transfer.fee), TRANSACTION_TYPES.INTRABANK_TRANSFER_FEE],
                [toAccount.id, transfer.amount - Math.abs(transfer.fee), TRANSACTION_TYPES.INTRABANK_RECEIVE]
            ]]);
        } else {
            [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
                fromAccount.balance - transfer.amount,
                fromAccount.id
            ]);
            [results] = await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [
                toAccount.balance + transfer.amount,
                toAccount.id
            ]);

            [results] = await connection.query('INSERT INTO transactions (accountId, amount, typeId) VALUES ?', [[
                [fromAccount.id, -transfer.amount, TRANSACTION_TYPES.INTRABANK_TRANSFER],
                [toAccount.id, transfer.amount, TRANSACTION_TYPES.INTRABANK_RECEIVE]
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

        [results] = await connection.query('INSERT INTO transactions (accountId, amount, typeId) VALUES ?', [[
            [fromAccount.id, -transfer.amount, TRANSACTION_TYPES.PAY_DEBT_TRANSFER],
            [fromAccount.id, -transfer.fee, TRANSACTION_TYPES.INTRABANK_TRANSFER_FEE],
            [toAccount.id, transfer.amount, TRANSACTION_TYPES.PAY_DEBT_RECEIVE]
        ]]);

        [results] = await connection.query('UPDATE transfers SET statusId = ? WHERE id = ?', [TRANSFER_STATUS.COMFIRMED, transferId]);

        [results] = await connection.query('UPDATE debts SET statusId = ? WHERE transferId = ?', [DEBT_STATUS.PAID], transfer.id);
    });
};
export const makeTransferExpired = async (transferId) => {
    await pool_query('UPDATE transfers SET statusId = ? WHERE id = ?', TRANSFER_STATUS.OVERTIME, transferId);
};

export const makeTransferCanceled = async (transferId) => {
    await pool_query('UPDATE transfers SET statusId = ? WHERE id = ?', TRANSFER_STATUS.CANCELED);
};

export const makeTransferRejected = async (transferId) => {
    await pool_query('UPDATE transfers SET statusId = ? WHERE id = ?', TRANSFER_STATUS.REJECTED);
};
