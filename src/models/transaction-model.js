import mysql from 'mysql';
import { doQuery } from '../database/mysql-db.js';

export const findByAccountId = (accountId, limit, startingAfter) => {
    return doQuery(async (connection) => {
        const [results] = await connection.query(
            'SELECT ts.id, ts.amount, types.type, ts.createdAt ' +
            'FROM transactions ts ' +
            'INNER JOIN transaction_types types ON ts.typeId = types.id ' +
            `WHERE accountId = ${mysql.escape(accountId)} ` +
            (startingAfter !== null ? `AND ts.id < ${mysql.escape(startingAfter)} ` : '') +
            'ORDER BY ts.id DESC ' +
            'LIMIT ?',
            [limit]
        );

        return results;
    });
};

export const findByCustomerId = (customerId, limit, startingAfter) => {
    return doQuery(async (connection) => {
        const [results] = await connection.query(
            'SELECT ts.id, acc.accountNumber, ts.amount, ts.currencyId, tst.type, ts.createdAt ' +
            'FROM transactions ts ' +
            'INNER JOIN transaction_types tst ON ts.typeId = tst.id ' +
            'INNER JOIN accounts acc ON ts.accountId = acc.id ' +
            `WHERE ts.accountId IN (SELECT acc2.id FROM accounts acc2 WHERE acc2.customerId = ${mysql.escape(customerId)}) ` +
            (startingAfter !== null ? `AND ts.id < ${mysql.escape(startingAfter)} ` : '') +
            'ORDER BY ts.id DESC ' +
            'LIMIT ?',
            [limit]
        );

        return results;
    });
};
