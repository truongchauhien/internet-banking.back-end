import { pool_query } from '../database/mysql-db.js';

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

export const updateRefreshToken = (id, refreshToken) => {
    const [results, fields] = pool_query('UPDATE administrators SET refreshToken = ? WHERE id = ?', [refreshToken, id]);
    return results.affectedRows;
};
