import mysql from 'mysql';
import configs from '../configs/configs.js';
import { MySqlError } from './mysql-error.js';
import logger from '../logger/logger.js';

export const pool = mysql.createPool({
    connectionLimit: 255,
    host: configs.get('database.host'),
    port: configs.get('database.port'),
    user: configs.get('database.user'),
    password: configs.get('database.password'),
    database: configs.get('database.name'),
    typeCast: (field, next) => {
        if (field.type === 'TINY' && field.length === 1) {
            return (field.string() === '1');
        }
        
        return next();
    }
});

/**
 * 
 * @param {string | mysql.Query} sql 
 * @param {*} values 
 */
export const pool_query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results, fields) => {
            if (error) {
                reject(new MySqlError(error));
            } else {
                resolve([results, fields]);
            }
        });
    });
};

// this: mysql.Pool
const _pool_getConnection = function () {
    return new Promise((resolve, reject) => {
        this.getConnection((error, connection) => {
            if (error) {
                reject(new MySqlError(error));
            } else {
                resolve(connection);
            }
        });
    })
};

// this: mysql.Connection
const _connection_release = function () {
    this.release();
};

// this: mysql.Connection
const _connection_beginTransaction = function () {
    return new Promise((resolve, reject) => {
        this.beginTransaction(error => {
            if (error) {
                reject(new MySqlError(error));
            } else {
                resolve();
            }
        });
    });
};

// this: mysql.Connection
const _connection_commit = function () {
    return new Promise((resolve, reject) => {
        this.commit(error => {
            if (error) {
                reject(new MySqlError(error));
            } else {
                resolve();
            }
        });
    });
};

// this: mysql.Connection
const _connection_rollback = function () {
    return new Promise((resolve, reject) => {
        this.rollback(error => {
            if (error) {
                reject(new MySqlError(error));
            } else {
                resolve();
            }
        });
    });
};

// this: mysql.Connection
const _connection_query = function (sql, values) {
    return new Promise((resolve, reject) => {
        this.query(sql, values, (error, results, fields) => {
            if (error) {
                reject(new MySqlError(error));
            } else {
                resolve([results, fields]);
            }
        });
    });
};

export const getConnection = async () => {
    const pool_getConnection = _pool_getConnection.bind(pool);
    const connection = await pool_getConnection();
    return {
        connection: connection,
        release: _connection_release.bind(connection),
        beginTransaction: _connection_beginTransaction.bind(connection),
        commit: _connection_commit.bind(connection),
        rollback: _connection_rollback.bind(connection),
        query: _connection_query.bind(connection)
    };
};

export const doTransaction = async (query) => {
    const connection = await getConnection();
    try {
        await connection.beginTransaction();
        const ret = await query(connection);
        await connection.commit();
        return ret;
    } catch (ex) {
        await connection.rollback();
        throw ex;
    } finally {
        connection.release();
    }
};

export const doQuery = async (query) => {
    const connection = await getConnection();
    try {
        return await query(connection);
    } finally {
        connection.release();
    }
};

(async () => {
    pool.getConnection((err, connection) => {
        if (err) {
            logger.err(err);
        } else {
            logger.info('The connection to MySQL server is OK.');
            connection.release();
        }
    })
})();
