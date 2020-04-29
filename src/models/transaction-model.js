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
