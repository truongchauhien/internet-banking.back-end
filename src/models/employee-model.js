import { pool_query } from '../modules/database/mysql-db.js';
import mysql from 'mysql';

export const getAll = async (fields = ['id', 'userName', 'fullName', 'email']) => {
    const [results] = await pool_query('SELECT ?? FROM employees ORDER BY id DESC', [fields]);
    return results;
};

export const getByUserName = async userName => {
    const [results, fields] = await pool_query('SELECT * FROM employees WHERE userName = ?', [userName]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
};

export const getByEmail = async email => {
    const [results, fields] = await pool_query('SELECT * FROM employees WHERE email = ?', [email]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
};

export const getById = async id => {
    const [results] = await pool_query('SELECT * FROM employees WHERE id = ?', [id]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
};

export const createEmployee = async (employee) => {
    let results;
    [results] = await pool_query('INSERT INTO employees SET ?', [employee]);
    const employeeId = results.insertId;
    [results] = await pool_query('SELECT * FROM employees WHERE id = ?', [employeeId]);
    return results[0];
};

export const update = (id, changes) => {
    return pool_query('UPDATE employees SET ? WHERE id = ?', [changes, id]);
};

export const remove = (id) => {
    return pool_query('DELETE FROM employees WHERE id = ?', [id]);
};
