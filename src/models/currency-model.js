import { pool_query } from '../database/mysql-db.js';

export const getById = async (currencyId) => {
    const [results] = await pool_query('SELECT * FROM currencies WHERE id = ?', [currencyId]);
    if (results) return results[0];
    return null;
};
