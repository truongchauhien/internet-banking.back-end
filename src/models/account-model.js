import { pool_query } from '../database/mysql-db.js';

export const getCurrentAccount = async (customerId) => {
    const [results, fields] = await pool_query('SELECT * FROM accounts WHERE customerId = ? AND accountType = ?', [customerId, 'CURRENT']);
    if (results) {
        return results[0];
    }

    return null;
};

export const getAllAccounts = async (customerId) => {
    const [results, fields] = await pool_query('SELECT * FROM accounts WHERE customerId = ?', [customerId]);
    if (results) {
        return results;
    }

    return [];
};

export const getAccountByAccountNumber = async (accountNumber) => {
    const [results] = await pool_query('SELECT * FROM accounts WHERE accountNumber = ?', [accountNumber]);
    if (results) {
        return results[0];
    }

    return null;
};
