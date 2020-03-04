import mysql from 'mysql';
import { promisify } from 'util';
import config from '../configs/config-schema.js';

export const pool = mysql.createPool({
    connectionLimit: 255,
    host: config.get('database.host'),
    port: config.get('database.port'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.name')
});

/**
 * 
 * @param {string | mysql.Query} sql 
 * @param {*} values 
 */
export const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve([results, fields]);
            }
        });
    });
};
