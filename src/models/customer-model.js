import { pool_query, doTransaction, doQuery } from '../database/mysql-db.js';
import CURRENCIES from './constants/currencies.js';

export const getByUserName = async userName => {
    const [results, fields] = await pool_query('SELECT * FROM customers WHERE userName = ?', [userName]);
    if (results) {
        return results[0];
    }

    return null;
}

export const getByEmail = async email => {
    const [results, fields] = await pool_query('SELECT * FROM customers WHERE email = ?', [email]);
    if (results) {
        return results[0];
    }

    return null;
};

export const getById = async id => {
    const [results] = await pool_query('SELECT * FROM customers WHERE id = ?', [id]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }
    return null;
};

export const getByAccountNumber = async accountNumber => {
    const [results] = await pool_query(
        'SELECT customers.id, customers.userName, customers.password, ' +
        '       customers.fullName, customers.email, customers.otpSecret, ' +
        '       customers.refreshToken ' +
        'FROM customers ' +
        'INNER JOIN accounts ON accounts.customerId = customers.id ' +
        'WHERE accounts.accountNumber = ?', [accountNumber]);

    if (Array.isArray(results) && results.length > 0) return results[0];
    return null;
};

export const createCustomer = (customer) => {
    return doTransaction(async (connection) => {
        let results;

        // Create customer login.
        [results] = await connection.query('INSERT INTO customers SET ?', customer);
        const customerId = results.insertId;
        // ================================

        // Create "current account".
        [results] = await connection.query('SELECT * FROM configurations WHERE name = ?', ['nextAccountNumber']);
        const nextAccountNumber = Number(results[0]['value']);

        const accountNumber = '1' + nextAccountNumber.toString().padStart(9, '0');
        const currentAccount = {
            accountNumber: accountNumber,
            customerId: customerId,
            balance: 0,
            currencyId: CURRENCIES.vnd,
            accountType: 'CURRENT'
        };
        [results] = await connection.query('INSERT INTO accounts SET ?', currentAccount);
        // ================================

        [results] = await connection.query('UPDATE configurations SET value = ? WHERE name = ?', [nextAccountNumber + 1, 'nextAccountNumber']);
        const currentAccountId = results.insertId;

        return {
            id: customerId,
            ...customer,
            currentAccount: {
                id: currentAccountId,
                ...currentAccount
            }
        };
    });
};

export const update = (id, changes) => {
    return pool_query('UPDATE customers SET ? WHERE id = ?', [changes, id]);
};
