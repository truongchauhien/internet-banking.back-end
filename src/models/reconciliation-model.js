import { pool_query, doQuery } from '../modules/database/mysql-db.js';

export const getAll = async () => {
    const [results] = await pool_query('SELECT * FROM reconciliations ORDER BY id DESC');
    return results;
};

export const create = async (reconciliation) => {
    return doQuery(async (connection) => {
        let results;
        [results] = await connection.query('INSERT INTO reconciliations SET ?', [reconciliation]);
        const id = results.insertId;
        [results] = await connection.query('SELECT * FROM reconciliations WHERE id = ?', [id]);
        if (Array.isArray(results) && results.length > 0) {
            return results[0];
        }
        return null;
    });
};

export const update = (id, updates) => {
    return pool_query('UPDATE reconciliations SET ? WHERE id = ?', [updates, id]);
};

export const deleteById = async (id) => {
    const [results] = await pool_query('DELETE FROM reconciliations WHERE id = ?', [id]);
    if (results.affectedRows > 0) {
        return true;
    }
    return false;
};
