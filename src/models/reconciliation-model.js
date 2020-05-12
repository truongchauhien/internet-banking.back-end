import { pool_query } from '../modules/database/mysql-db.js';

export const create = async (reconciliation) => {
    const [results] = await pool_query('INSERT INTO reconciliations SET ?', [reconciliation]);
    return results.insertId;
};
