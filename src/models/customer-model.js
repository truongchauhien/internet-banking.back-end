import { pool_query, getTransaction, doTransaction } from '../database/mysql-db.js';

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

export const createCustomer = async (customer) => {
    return await doTransaction(async (transaction) => {
        let results;
        
        // Create customer login.
        [results] = await transaction.query('INSERT INTO customers SET ?', customer);
        const customerId = results.insertId;

        // Create "current account".
        [results] = await transaction.query('SELECT * FROM configurations WHERE name = ?', ['nextAccountNumber']);
        const nextAccountNumber = Number(results[0]['value']);

        const accountNumber = '1' + nextAccountNumber.toString().padStart(9, '0');
        [results] = await transaction.query('INSERT INTO accounts SET ?', {
            accountNumber: accountNumber,
            customerId: customerId,
            balance: 0,
            accountType: 'CURRENT'
        });

        [results] = await transaction.query('UPDATE configurations SET value = ? WHERE name = ?', [nextAccountNumber + 1, 'nextAccountNumber']);

        return accountNumber;
    });

    /*
    try {
        let results;
        await transaction.beginTransaction();

        // Create customer login.
        [results] = await transaction.query('INSERT INTO customers SET ?', customer);
        const customerId = results.insertId;

        // Create "current account".
        [results] = await transaction.query('SELECT * FROM configurations WHERE name = ?', ['nextAccountNumber']);
        const nextAccountNumber = Number(results[0]['value']);

        const accountNumber = '1' + nextAccountNumber.toString().padStart(9, '0');
        [results] = await transaction.query('INSERT INTO accounts SET ?', {
            accountNumber: accountNumber,
            customerId: customerId,
            balance: 0,
            accountType: 'CURRENT'
        });

        [results] = await transaction.query('UPDATE configurations SET value = ? WHERE name = ?', [nextAccountNumber + 1, 'nextAccountNumber']);

        await transaction.commit();
        return accountNumber;
    } catch (ex) {
        await transaction.rollback();
        throw ex;
    } finally {
        transaction.release();
    }
    */
};
