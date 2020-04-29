import { pool_query } from '../database/mysql-db.js';

export const getCurrentAccountByCustomerId = async (customerId) => {
    const [results, fields] = await pool_query('SELECT * FROM accounts WHERE customerId = ? AND accountType = ?', [customerId, 'CURRENT']);
    if (results) {
        return results[0];
    }

    return null;
};

export const getAllByCustomerId = async (customerId) => {
    const [results, fields] = await pool_query('SELECT * FROM accounts WHERE customerId = ?', [customerId]);
    if (results) {
        return results;
    }

    return [];
};

export const getByAccountNumber = async (accountNumber) => {
    const [results] = await pool_query('SELECT * FROM accounts WHERE accountNumber = ?', [accountNumber]);
    if (results) {
        return results[0];
    }
    return null;
};

export const getById = async (accountId) => {
    const [results] = await pool_query('SELECT * FROM accounts WHERE id = ?', [accountId]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }
    return null;
};
