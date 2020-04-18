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

function createFinder(fieldContainerCustomerId) {
    return (customerId, fromTime, toTime, newOnly, pageSize, pageNumber) => {
        return doQuery(async (connection) => {
            const condition = mysql.format(
                'WHERE ?? = ? ' + (newOnly ? `AND statusId = ${DEBT_STATUS.NEW} ` : '') +
                'ORDER BY createdAt ' +
                'WHERE createdAt > ? AND createdAt < ? '
                [fieldContainerCustomerId, customerId, fromTime, toTime]
            );

            let results;
            [results] = await connection.query('SELECT COUNT(id) as totalRecords FROM debts ' + condition);
            const totalRecords = results[0].totalRecords;
            const totalPages = Math.ceil(totalRecords / pageSize);
            const offset = (pageNumber - 1) * pageSize;
            [results] = await connection.query(
                'SELECT * FROM debts ' + condition + ' ' +
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

export const getDebtById = async (debtId) => {
    const [results] = await pool_query('SELECT * FROM debts WHERE id = ?', [debtId]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }
    return null;
};

export const getDebtByTransferId = async (transferId) => {
    const [results] = await pool_query('SELECT * FROM debts WHERE transferId = ?', [transferId]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }
    return null;
};
