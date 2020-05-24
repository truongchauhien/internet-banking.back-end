import { doTransaction } from '../modules/database/mysql-db.js';
import CURRENCIES from './constants/currencies.js';
import TRANSACTION_TYPES from './constants/transaction-types.js';

export const create = (deposit) => {
    return doTransaction(async (connection) => {
        let results;
        const currentDate = new Date();

        [results] = await connection.query('INSERT INTO deposits SET ?', [deposit]);
        const depositId = results.insertId;

        [results] = await connection.query('SELECT id, currencyId FROM accounts WHERE id = ?', [deposit.accountId]);
        const account = results[0];

        [results] = await connection.query('SELECT exchangeRate FROM exchange_rates WHERE fromCurrencyId = ? AND toCurrencyId = ? AND fromDate <= ? AND ? < toDate ',
            [deposit.currencyId, account.currencyId, currentDate, currentDate]
        );
        const exchangeRate = results[0].exchangeRate;
        const amount = deposit.amount * exchangeRate;

        [results] = await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, account.id]);
        [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [[
            [account.id, amount, account.currencyId, TRANSACTION_TYPES.DEPOSIT]
        ]]);

        [results] = await connection.query('SELECT * FROM deposits WHERE id = ?', [depositId]);
        return results[0];
    });
};
