import { pool_query } from '../database/mysql-db.js';

export const getAllBanks = async () => {
    const [results] = await pool_query(
        'SELECT * ' +
        'FROM third_party_banking_apis ' +
        'INNER JOIN banks ON third_party_banking_apis.bankId = banks.id'
    );
    return results;
};
