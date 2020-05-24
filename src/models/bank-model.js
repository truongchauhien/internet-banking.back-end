import { pool_query } from '../modules/database/mysql-db.js';

export const getAll = async (fields = ['id', 'name', 'hasApi', 'partnerCode', 'secretKey']) => {
    const [results] = await pool_query('SELECT ?? FROM banks', [fields]);
    return results;
};

export const getByPartnerCode = async (partnerCode) => {
    const [results] = await pool_query('SELECT * FROM banks WHERE partnerCode = ?', [partnerCode]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
};
