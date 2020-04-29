import { pool_query } from '../database/mysql-db.js';

export const createNotification = async ({ customerId, title, content, typeId, statusId }) => {
    const notification = {
        customerId,
        title,
        content,
        typeId,
        statusId
    };

    const [results] = await pool_query('INSERT INTO notifications SET ?', [notification]);

    return {
        id: results.insertId,
        ...notification
    };
};
