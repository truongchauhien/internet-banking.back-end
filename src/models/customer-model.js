import { pool_query, doTransaction, doQuery } from '../modules/database/mysql-db.js';
import CURRENCIES from './constants/currencies.js';
import ACCOUNT_TYPES from './constants/account-types.js';
import ACCOUNT_STATUS from './constants/account-status.js';

export const getByUserName = async userName => {
    const [results] = await pool_query('SELECT * FROM customers WHERE userName = ?', [userName]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
}

export const getByEmail = async email => {
    const [results] = await pool_query('SELECT * FROM customers WHERE email = ?', [email]);
    if (Array.isArray(results) && results.length > 0) {
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

/**
 * 
 * @param {object} customer
 * @param {string} customer.userName
 * @param {string} customer.password
 * @param {string} customer.fullName
 * @param {string} customer.email
 * @param {string} customer.phone
 * @param {string} customer.otpSecret
 */
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
            customerId: customerId,
            accountNumber: accountNumber,
            balance: 0,
            currencyId: CURRENCIES.VND,
            statusId: ACCOUNT_STATUS.OPEN,
            typeId: ACCOUNT_TYPES.CURRENT
        };
        [results] = await connection.query('INSERT INTO accounts SET ?', currentAccount);
        const currentAccountId = results.insertId;
        // ================================

        // Increment next account number
        [results] = await connection.query('UPDATE configurations SET value = ? WHERE name = ?', [nextAccountNumber + 1, 'nextAccountNumber']);
        // ================================

        // Assign the created "current account" as the default current account for the created customer.
        [results] = await connection.query('UPDATE customers SET defaultCurrentAccountId = ? WHERE id = ?', [currentAccountId, customerId]);
        // ================================

        return {
            customer: {
                id: customerId,
                ...customer,
                defaultCurrentAccountId: currentAccountId,
            },
            currentAccount: {
                id: currentAccountId,
                ...currentAccount
            }
        };
    });
};

export const updateById = async (id, changes) => {
    const [results] = await pool_query('UPDATE customers SET ? WHERE id = ?', [changes, id]);
    return results.changedRows > 0;
};
