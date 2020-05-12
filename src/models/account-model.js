import { pool_query } from '../database/mysql-db.js';

export const getCurrentAccountByCustomerId = async (customerId) => {
    const [results] = await pool_query('SELECT * FROM accounts WHERE customerId = ? AND accountType = ?', [customerId, 'CURRENT']);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
};

export const getAllByCustomerId = async (customerId) => {
    const [results] = await pool_query('SELECT * FROM accounts WHERE customerId = ?', [customerId]);
    if (Array.isArray(results)) {
        return results;
    }

    return null;
};

export const getByAccountNumber = (accountNumber) => {
    return getAccount('accountNumber', accountNumber);
};

export const getById = (accountId) => {
    return getAccount('id', accountId);
};

async function getAccount(identityType, identity) {
    const [results] = await pool_query('SELECT * FROM accounts WHERE ?? = ?', [identityType, identity]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
}
