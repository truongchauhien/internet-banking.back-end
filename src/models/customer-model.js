import { pool_query, doTransaction } from '../database/mysql-db.js';

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

export const createCustomer = (customer) => {
    return doTransaction(async (connection) => {
        let results;

        // Create customer login.
        [results] = await connection.query('INSERT INTO customers SET ?', customer);
        const customerId = results.insertId;

        // Create "current account".
        [results] = await connection.query('SELECT * FROM configurations WHERE name = ?', ['nextAccountNumber']);
        const nextAccountNumber = Number(results[0]['value']);

        const accountNumber = '1' + nextAccountNumber.toString().padStart(9, '0');
        [results] = await connection.query('INSERT INTO accounts SET ?', {
            accountNumber: accountNumber,
            customerId: customerId,
            balance: 0,
            accountType: 'CURRENT'
        });

        [results] = await connection.query('UPDATE configurations SET value = ? WHERE name = ?', [nextAccountNumber + 1, 'nextAccountNumber']);

        return accountNumber;
    });
};
