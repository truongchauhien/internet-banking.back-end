import { pool_query } from '../database/mysql-db.js';

export const getAllBanks = async (fields = ['id', 'name', 'hasApi', 'partnerCode']) => {
    const [results] = await pool_query('SELECT ?? FROM banks', [fields]);
    return results;
};
