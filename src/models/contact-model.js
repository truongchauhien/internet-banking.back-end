import { pool_query } from '../modules/database/mysql-db.js';

export const findAllContacts = async customerId => {
    const [results, fields] = await pool_query('SELECT * FROM contacts WHERE customerId = ?', [customerId]);
    if (results) {
        return results;
    }

    return [];
};

export const getContactById = async contactId => {
    const [results, fields] = await pool_query('SELECT * FROM contacts WHERE id = ?', [contactId]);
    if (results) {
        return results[0];
    }

    return null;
}

export const createContact = async contact => {
    const [results] = await pool_query('INSERT INTO contacts SET ?', contact);
    return results.insertId;
};

export const deleteContact = async contactId => {
    const [results] = await pool_query('DELETE FROM contacts WHERE id = ?', [contactId]);
    return (results.affectedRows !== 0);
};

export const updateContact = async (contactId, fields) => {
    const [results] = await pool_query('UPDATE contacts SET ? WHERE id = ?', [fields, contactId]);
    return (results.affectedRows !== 0);
};
