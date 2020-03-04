import { query } from '../database/mysql-db.js';

export const getByUserName = async userName => {
    const [results, fields] = await query('SELECT * FROM employees WHERE userName = ?', [userName]);
    if (results) {
        return results[0];
    }

    return null;
};

export const getByEmail = async email => {
    const [results, fields] = await query('SELECT * FROM employees WHERE email = ?', [email]);
    if (results) {
        return results[0];
    }

    return null;
};

export const getById = async id => {
    const [results] = await query('SELECT * FROM employees WHERE id = ?', [id]);
    if (results) {
        return results[0];
    }

    return null;
}

export const updateRefreshToken = (id, refreshToken) => {
    const [results, fields] = query('UPDATE employees SET refreshToken = ? WHERE id = ?', [refreshToken, id]);
    return results.affectedRows;
};
