import { pool_query } from '../modules/database/mysql-db.js';

export const getById = async (currencyId) => {
    const [results] = await pool_query('SELECT * FROM currencies WHERE id = ?', [currencyId]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }
    return null;
};

export const getByCode = async (currencyCode) => {
    const [results] = await pool_query('SELECT * FROM currencies WHERE code = ?', [currencyCode]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }
    return null;
};
