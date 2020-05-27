import { pool_query, doTransaction } from '../modules/database/mysql-db.js';
import TransactionCanceled from './extensions/transaction-canceled.js';
import TRANSACTION_TYPES from './constants/transaction-types.js';
import ACCOUNT_TYPES from './constants/account-types.js';
import ACCOUNT_STATUS from './constants/account-status.js';

export const getDefaultCurrentAccountByCustomerId = async (customerId) => {
    const [results] = await pool_query('SELECT accounts.* FROM accounts INNER JOIN customers ON customers.defaultCurrentAccountId = accounts.id WHERE customers.id = ?', [customerId]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
};

export const getAllByCustomerId = async (customerId, withStatus = [ACCOUNT_STATUS.OPEN]) => {
    const [results] = await pool_query(
        'SELECT accounts.*, account_types.type ' +
        'FROM accounts ' +
        '    INNER JOIN account_types ON accounts.typeId = account_types.id ' +
        'WHERE accounts.customerId = ? AND accounts.statusId IN (?)',
        [customerId, withStatus]
    );
    if (Array.isArray(results)) {
        return results;
    }

    return null;
};

export const getAllByCustomerUserName = async (customerUserName, withStatus = [ACCOUNT_STATUS.OPEN]) => {
    const [results] = await pool_query(
        'SELECT accounts.*, account_types.type ' +
        'FROM accounts ' +
        '    INNER JOIN account_types ON accounts.typeId = account_types.id ' +
        '    INNER JOIN customers ON accounts.customerId = customers.id' +
        'WHERE customers.userName = ? AND accounts.statusId IN (?)', [customerUserName, withStatus]);
    if (Array.isArray(results)) {
        return results;
    }

    return null;
};

export const getByAccountNumber = (accountNumber) => {
    return getAccount('accountNumber', accountNumber);
};

export const getById = (accountId) => {
    return getAccount('id', accountId);
};

async function getAccount(identityType, identity) {
    const [results] = await pool_query(
        'SELECT accounts.*, account_types.type ' +
        'FROM accounts ' +
        '    INNER JOIN account_types ON accounts.typeId = account_types.id ' +
        'WHERE accounts.?? = ?', [identityType, identity]);
    if (Array.isArray(results) && results.length > 0) {
        return results[0];
    }

    return null;
}

export const updateById = async (id, changes) => {
    const [results] = await pool_query('UPDATE accounts SET ?  WHERE id = ?', [changes, id]);
    return results.changedRows > 0;
};

export const closeAccount = (closedAccountId, transferredAccountId) => {
    return doTransaction(async (connection) => {
        let results;

        [results] = await connection.query('SELECT * FROM accounts WHERE id = ?', [closedAccountId]);
        const closedAccount = results[0];
        if (!closedAccount) throw new TransactionCanceled('Closed account does not exist.');

        [results] = await connection.query('SELECT * FROM accounts WHERE id = ?', [transferredAccountId]);
        const transferredAccount = results[0];
        if (!transferredAccount) throw new TransactionCanceled('Transferred account does not exist.');

        if (closedAccount.isClosed) throw new TransactionCanceled('Closed account is already closed.');
        if (closedAccount.id === transferredAccount.id) throw new TransactionCanceled('Closed account is the same as transferred account.');
        if (closedAccount.customerId !== transferredAccount.customerId) throw new TransactionCanceled('Closed account customer id is not the same as transferred account customer id.');
        if (closedAccount.currencyId !== transferredAccount.currencyId) throw new TransactionCanceled('Closed account currency is not the same as transferred account currency.');
        if (transferredAccount.isClosed) throw new TransactionCanceled('Transferred account is closed.');
        if (transferredAccount.typeId !== ACCOUNT_TYPES.CURRENT) throw new TransactionCanceled('Transferred account is not current account.');

        [results] = await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [closedAccount.balance, transferredAccount.id]);
        [results] = await connection.query('UPDATE accounts SET balance = ?, statusId = ? WHERE id = ?', [0, ACCOUNT_STATUS.CLOSED, closedAccount.id]);

        [results] = await connection.query('INSERT INTO transactions (accountId, amount, currencyId, typeId) VALUES ?', [
            [
                [closedAccount.id, -closedAccount.balance, closedAccount.currencyId, TRANSACTION_TYPES.CLOSE_ACCOUNT_TRANSFER],
                [transferredAccount.id, closedAccount.balance, transferredAccount.currencyId, TRANSACTION_TYPES.CLOSE_ACCOUNT_RECEIVE]
            ]
        ]);

        const customerId = closedAccount.customerId;
        [results] = await connection.query('SELECT defaultCurrentAccountId FROM customers WHERE id = ?', [customerId]);
        const customer = results[0];
        if (customer.defaultCurrentAccountId === closedAccount.id) {
            [results] = await connection.query('UPDATE customers SET defaultCurrentAccountId = ? WHERE id = ?', [transferredAccount.id, customerId]);
        }
    });
};

export const createAccount = ({ customerId, typeId, currencyId }) => {
    return doTransaction(async (connection) => {
        let results;

        // Generate account number.
        [results] = await connection.query('SELECT * FROM configurations WHERE name = ?', ['nextAccountNumber']);
        const nextAccountNumber = Number(results[0]['value']);
        [results] = await connection.query('UPDATE configurations SET value = ? WHERE name = ?', [nextAccountNumber + 1, 'nextAccountNumber']);

        let accountNumber;
        if (typeId == ACCOUNT_TYPES.CURRENT) {
            accountNumber = '1' + nextAccountNumber.toString().padStart(9, '0');
        } else if (type === ACCOUNT_TYPES.DEPOSIT) {
            accountNumber = '2' + nextAccountNumber.toString().padStart(9, '0');
        } else {
            throw new TransactionCanceled('Bad account type.');
        }
        // ================================

        const account = {
            customerId,
            accountNumber,
            balance: 0,
            currencyId,
            typeId,
            statusId: ACCOUNT_STATUS.OPEN,
        };
        [results] = await connection.query('INSERT INTO accounts SET ?', [account]);
        const accountId = results.insertId;

        [results] = await connection.query(
            'SELECT accounts.*, account_types.type ' +
            'FROM accounts ' +
            '    INNER JOIN account_types ON accounts.typeId = account_types.id ' +
            'WHERE accounts.id = ?',
            [accountId]
        );

        if (Array.isArray(results) && results.length > 0) {
            return results[0];
        }

        throw new TransactionCanceled('Unknown error');
    });
};
