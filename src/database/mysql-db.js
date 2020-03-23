import mysql from 'mysql';
import config from '../configs/config-schema.js';
import { MySqlError } from './mysql-error.js';
import logger from '../modules/logger/logger.js';

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

export const getTransaction = async () => {
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

export const doTransaction = async (callback) => {
    const transaction = await getTransaction();
    try {
        await transaction.beginTransaction();
        const ret = await callback(transaction);
        await transaction.commit();
        return ret;
    } catch (ex) {
        await transaction.rollback();
        throw ex;
    } finally {
        transaction.release();
    }
}

(async () => {
    pool.getConnection((err, connection) => {
        if (err) {
            logger.err(err);
        } else {
            logger.info('The connection to MySQL server is OK!');
            connection.release();
        }
    })
})();
