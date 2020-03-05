import { pool_query } from '../database/mysql-db.js';

export const getByUserName = async userName => {
    const [results, fields] = await pool_query('SELECT * FROM customers WHERE userName = ?', [userName]);
    if (results) {
        return results[0];
    }

    return null;
}

export const getByEmail = async email => {
    const [results, fields] = await pool_query('SELECT * FROM customers WHERE email = ?', [email]);
    if (results) {
        return results[0];
    }

    return null;
};

export const getById = async id => {
    const [results] = await pool_query('SELECT * FROM customers WHERE id = ?', [id]);
    if (results) {
        return results[0];
    }

    return null;
}

export const updateRefreshToken = async (id, refreshToken) => {
    const [results, fields] = await pool_query('UPDATE customers SET refreshToken = ? WHERE id = ?', [refreshToken, id]);
    return results.affectedRows;
};
