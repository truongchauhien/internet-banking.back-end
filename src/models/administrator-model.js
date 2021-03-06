import { pool_query } from '../modules/database/mysql-db.js';

export const getByUserName = async userName => {
    const [results, fields] = await pool_query('SELECT * FROM administrators WHERE userName = ?', [userName]);
    if (results) {
        return results[0];
    }

    return null;
};

export const getByEmail = async email => {
    const [results, fields] = await pool_query('SELECT * FROM administrators WHERE email = ?', [email]);
    if (results) {
        return results[0];
    }

    return null;
};

export const getById = async id => {
    const [results] = await pool_query('SELECT * FROM administrators WHERE id = ?', [id]);
    if (results) {
        return results[0];
    }

    return null;
}

export const updateById = (id, changes) => {
    return pool_query('UPDATE administrators SET ? WHERE id = ?', [changes, id]);
};
