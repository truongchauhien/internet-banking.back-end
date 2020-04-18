import { doQuery } from '../database/mysql-db.js';

export const findTransactionByAccountNumber = (accountNumber, from, to) => {
    return doQuery(async (connection) => {
        let results;

        [results] = await connection.query('SELECT * FROM accounts WHERE accountNumber = ?', [accountNumber]);
        if (!results) {
            return [];
        }

        const account = results[0];

        [results] = await connection.query(
            'SELECT ts.id, ts.amount, tst.type, ts.createAt ' +
            'FROM transactions ts ' +
            'INNER JOIN transaction_types tst ON ts.typeId = tst.id' +
            'WHERE accountId = ? AND WHERE ts.createAt BETWEEN ? AND ?',
            [account.id, from, to]
        );

        return results;
    });
};
