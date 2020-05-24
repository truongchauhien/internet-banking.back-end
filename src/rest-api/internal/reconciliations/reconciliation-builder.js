/**
 * This file will be run in a Worker Thread.
 */

import { workerData, parentPort } from 'worker_threads';
import fs from 'fs';
import mysql from 'mysql';
import _ from 'lodash';
import BANKS from '../../../models/constants/banks.js';

const connection = mysql.createConnection({
    connectionLimit: 255,
    host: _.get(workerData, 'database.host'),
    port: _.get(workerData, 'database.port'),
    user: _.get(workerData, 'database.user'),
    password: _.get(workerData, 'database.password'),
    database: _.get(workerData, 'database.name'),
    typeCast: (field, next) => {
        if (field.type === 'TINY' && field.length === 1) {
            return (field.string() === '1');
        }

        return next();
    }
});

connection.connect((error) => {
    if (error) throw error;

    const reconciliationId = _.get(workerData, 'reconciliation.id');
    connection.query('SELECT * FROM reconciliations WHERE id = ?', [reconciliationId], (error, results, fields) => {
        if (error) throw error;

        if (!(Array.isArray(results) && results.length > 0)) throw new Error('Reconciliation is not found.');

        const reconciliationWriter = fs.createWriteStream(`./reconciliations/${reconciliationId}.csv`);
        reconciliationWriter.write('FromAccountNumber,FromBankName,ToAccountNumber,ToBankName,FromAmount,ToAmount\n');

        const reconciliation = results[0];
        connection.query(
            'SELECT transfers.id, ' +
            '    transfers.fromAccountNumber, transfers.toAccountNumber, ' +
            '    banks_1.name AS fromBankName, banks_2.name AS toBankName, ' +
            '    transfers.fromAmount, transfers.toAmount ' +
            'FROM transfers ' +
            '    LEFT OUTER JOIN banks banks_1 ON transfers.fromBankId = banks_1.id ' +
            '    LEFT OUTER JOIN banks banks_2 ON transfers.toBankId = banks_2.id ' +
            `WHERE (comfirmedAt BETWEEN ${mysql.escape(reconciliation.fromTime)} AND ${mysql.escape(reconciliation.toTime)}) ` +
            (reconciliation.withBankId === null ? `AND (transfers.fromBankId <> ${mysql.escape(BANKS.INTERNAL)} OR transfers.toBankId <> ${mysql.escape(BANKS.INTERNAL)})`
                : `AND (transfers.fromBankId = ${mysql.escape(reconciliation.withBankId)} OR transfers.toBankId = ${mysql.escape(reconciliation.withBankId)}) `)
        ).on('result', (row, index) => {
            if (!reconciliationWriter.write(`"${row.fromAccountNumber}","${row.fromBankName}","${row.toAccountNumber}","${row.toBankName}",${row.fromAmount},${row.toAmount}\n`)) {
                connection.pause();
                reconciliationWriter.once('drain', () => {
                    connection.resume();
                });
            }
        }).on('end', () => {
            connection.query('UPDATE reconciliations SET isGenerating = ? WHERE id = ?', [false, reconciliationId], (error, results, fields) => {
                if (error) throw error;

                reconciliationWriter.end();
                parentPort.postMessage('The reconciliation is generated completely.');
            });
        });
    });
});
