import { pool_query } from '../database/mysql-db.js';

export const getAll = async () => {
    const [results] = await pool_query(
        'SELECT * ' +
        'FROM linked_banks ' +
        'INNER JOIN banks ON linked_banks.bankId = banks.id'
    );
    return results;
};
