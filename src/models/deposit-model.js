import { doTransaction } from '../database/mysql-db.js';
import CURRENCIES from './constants/currencies.js';
import TRANSACTION_TYPES from './constants/transaction-types.js';

export const create = (deposit) => {
    return doTransaction(async (connection) => {
        let results;
        deposit.currencyId = CURRENCIES.vnd;
        [results] = await connection.query('INSERT INTO deposits SET ?', [deposit]);
        const depositId = results.insertId;
        [results] = await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [deposit.amount, deposit.accountId]);
        [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
            [deposit.accountId, deposit.amount, CURRENCIES.vnd, TRANSACTION_TYPES.DEPOSIT]
        ]]);
        [results] = await connection.query('SELECT * FROM deposits WHERE id = ?', [depositId]);
        return results[0];
    });
};
