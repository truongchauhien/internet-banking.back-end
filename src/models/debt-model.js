import { pool_query, doTransaction, doQuery, pool } from '../database/mysql-db.js';
import mysql from 'mysql';
import CURRENCIES from './constants/currencies.js';
import DEBT_STATUS from './constants/debt-status.js';
import TransactionCanceled from './extensions/transaction-canceled.js';

export const createDebt = async ({ fromCustomerId, toCustomerId, message, amount }) => {
    const debt = {
        fromCustomerId,
        toCustomerId,
        message,
        amount,
        currencyId: CURRENCIES.vnd,
        statusId: DEBT_STATUS.NEW
    };

    const [results] = await pool_query('INSERT INTO debts SET ?', [debt]);
    return {
        id: results.insertId,
        ...debt
    };
};

export const cancelDebt = ({ debtId, changerId, canceledReason }) => {
    return doTransaction(async (connection) => {
        let results;
        [results] = await connection.query('SELECT * FROM debts WHERE id = ?', [debtId]);
        if (!Array.isArray(results) || results.length === 0) throw new TransactionCanceled();
        const debt = results[0];

        if (debt.statusId !== DEBT_STATUS.NEW) throw new TransactionCanceled();

        let newStatus;
        if (changerId === debt.fromCustomerId) {
            newStatus = DEBT_STATUS.CANCELED_BY_SENDER;
        } else if (changerId === debt.toCustomerId) {
            newStatus = DEBT_STATUS.CANCELED_BY_RECEIVER;
        } else {
            throw new TransactionCanceled();
        }

        [results] = await connection.query('UPDATE debts SET ? WHERE id = ?', [{
            statusId: newStatus,
            canceledReason: canceledReason
        }, debtId]);
    });
};

function createFinder(fieldNameContainsCustomerId) {
    return (customerId, newOnly, limit, startingAfter) => {
        return doQuery(async (connection) => {
            let results;
            [results] = await connection.query(
                'SELECT debts.id, debts.fromCustomerId, debts.toCustomerId, debts.message, debts.canceledReason, debts.amount, debts.statusId, debts.transferId, debts.createdAt, ' +
                '       c1.fullName AS fromCustomerFullName, c2.fullName AS toCustomerFullName, ' +
                '       debt_status.status ' +
                'FROM debts ' +
                'INNER JOIN customers c1 ON debts.fromCustomerId = c1.id ' +
                'INNER JOIN customers c2 ON debts.toCustomerId = c2.id ' +
                'INNER JOIN debt_status ON debts.statusId = debt_status.id ' +
                `WHERE 1 = 1 ` +
                `${startingAfter !== null ? `AND debts.id < ${mysql.escape(startingAfter)}` : ''} ` +
                `${fieldNameContainsCustomerId !== null ?
                    `AND ${mysql.escapeId(fieldNameContainsCustomerId)} = ${mysql.escape(customerId)}` :
                    `AND ( ${mysql.escapeId('fromCustomerId')} = ${mysql.escape(customerId)} OR ${mysql.escapeId('toCustomerId')} = ${mysql.escape(customerId)} )`} ` +
                `${newOnly ? `AND statusId = ${mysql.escape(DEBT_STATUS.NEW)} ` : ''} ` +
                'ORDER BY debts.id DESC ' +
                'LIMIT ?',
                [limit]
            );

            return results;
        });
    }
}

export const findBySender = (customerId, newOnly, limit, startingAfter) => {
    return createFinder('fromCustomerId')(customerId, newOnly, limit, startingAfter);
};

export const findByReceiver = (customerId, newOnly, limit, startingAfter) => {
    return createFinder('toCustomerId')(customerId, newOnly, limit, startingAfter);
};

export const findByBothSenderAndReceiver = (customerId, newOnly, limit, startingAfter) => {
    return createFinder(null)(customerId, newOnly, limit, startingAfter);
};

const createGetter = (identityType) => async (identityValue) => {
    const [results] = await pool_query(
        'SELECT debts.id, debts.fromCustomerId, debts.toCustomerId, debts.message, debts.canceledReason, debts.amount, debts.statusId, debts.transferId, debts.createdAt, ' +
        '       c1.fullName AS fromCustomerFullName, c2.fullName AS toCustomerFullName, ' +
        '       debt_status.status ' +
        'FROM debts ' +
        'INNER JOIN customers c1 ON debts.fromCustomerId = c1.id ' +
        'INNER JOIN customers c2 ON debts.toCustomerId = c2.id ' +
        'INNER JOIN debt_status ON debts.statusId = debt_status.id ' +
        'WHERE debts.?? = ?',
        [identityType, identityValue]
    );
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
};

export const getDebtById = (debtId) => {
    return createGetter('id')(debtId);
};

export const getDebtByTransferId = async (transferId) => {
    return createGetter('transferId')(transferId);
};

export const getDebt = (identityType, identityValue) => {
    return createGetter(identityType)(identityValue);
}
