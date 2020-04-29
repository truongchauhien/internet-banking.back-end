import { pool_query, doTransaction, doQuery } from '../database/mysql-db.js';
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
        [results] = connection.query('SELECT * FROM debts WHERE id = ?', [debtId]);
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

function createFinder(customerIdFieldName) {
    return (customerId, fromTime, toTime, newOnly, pageSize, pageNumber) => {
        return doQuery(async (connection) => {
            let results;
            [results] = await connection.query(
                'SELECT COUNT(id) as totalRecords ' +
                'FROM debts ' +
                `WHERE createdAt >= ${mysql.escape(fromTime)} AND createdAt <= ${mysql.escape(toTime)} ` +
                `${customerIdFieldName !== null ?
                    `AND ${mysql.escapeId(customerIdFieldName)} = ${mysql.escape(customerId)}` :
                    `AND ( ${mysql.escapeId('fromCustomerId')} = ${mysql.escape(customerId)} OR ${mysql.escapeId('toCustomerId')} = ${mysql.escape(customerId)} )`} ` +
                `${newOnly ? `AND statusId = ${mysql.escape(DEBT_STATUS.NEW)} ` : ''} ` +
                'ORDER BY createdAt'
            );

            const totalRecords = results[0].totalRecords;
            const totalPages = Math.ceil(totalRecords / pageSize);
            const offset = (pageNumber - 1) * pageSize;
            [results] = await connection.query(
                'SELECT debts.id, debts.fromCustomerId, debts.toCustomerId, debts.message, debts.canceledReason, debts.amount, debts.statusId, debts.transferId, debts.createdAt, ' +
                '       c1.fullName AS fromCustomerFullName, c2.fullName AS toCustomerFullName, ' +
                '       debt_status.status ' +
                'FROM debts ' +
                'INNER JOIN customers c1 ON debts.fromCustomerId = c1.id ' +
                'INNER JOIN customers c2 ON debts.toCustomerId = c2.id ' +
                'INNER JOIN debt_status ON debts.statusId = debt_status.id ' +
                `WHERE createdAt >= ${mysql.escape(fromTime)} AND createdAt <= ${mysql.escape(toTime)} ` +
                `${customerIdFieldName !== null ?
                    `AND ${mysql.escapeId(customerIdFieldName)} = ${mysql.escape(customerId)}` :
                    `AND ( ${mysql.escapeId('fromCustomerId')} = ${mysql.escape(customerId)} OR ${mysql.escapeId('toCustomerId')} = ${mysql.escape(customerId)} )`} ` +
                `${newOnly ? `AND statusId = ${mysql.escape(DEBT_STATUS.NEW)} ` : ''} ` +
                'ORDER BY createdAt ' +
                'LIMIT ? OFFSET ?',
                [pageSize, offset]
            );

            return [totalPages, results];
        });
    }
}

export const findBySender = (customerId, fromTime, toTime, newOnly, pageSize, pageNumber) => {
    return createFinder('fromCustomerId')(customerId, fromTime, toTime, newOnly, pageSize, pageNumber);
};

export const findByReceiver = (customerId, fromTime, toTime, newOnly, pageSize, pageNumber) => {
    return createFinder('toCustomerId')(customerId, fromTime, toTime, newOnly, pageSize, pageNumber);
};

export const findByBothSenderAndReceiver = (customerId, fromTime, toTime, newOnly, pageSize, pageNumber) => {
    return createFinder(null)(customerId, fromTime, toTime, newOnly, pageSize, pageNumber)
};

export const getDebtById = async (debtId) => {
    const [results] = await pool_query('SELECT * FROM debts WHERE id = ?', [debtId]);
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
