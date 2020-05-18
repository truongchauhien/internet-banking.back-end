import path from 'path';
import url from 'url';
import fsmodule from 'fs';
import { Worker } from 'worker_threads';
import configs from '../../../modules/configs/configs.js';
import HttpErrors from '../../commons/errors/http-errors.js';
import * as reconciliationModel from '../../../models/reconciliation-model.js';
import pushService from '../../../modules/push-service/index.js';
import logger from '../../../modules/logger/logger.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fs = fsmodule.promises;

export const getReconciliations = async (req, res) => {
    const reconciliations = await reconciliationModel.getAll();
    return res.status(200).json({
        reconciliations
    });
};

export const createReconciliation = async (req, res) => {
    const { fromTime: rawFromTime, toTime: rawToTime, bankId = null } = req.body;

    const fromTime = new Date(rawFromTime);
    const toTime = new Date(rawToTime);
    if (Number.isNaN(fromTime.getTime()) || Number.isNaN(toTime.getTime())) {
        throw new HttpErrors.BadRequest();
    }

    const createdReconciliation = await reconciliationModel.create({
        fromTime,
        toTime,
        bankId,
        isGenerating: true
    });

    const worker = new Worker(path.join(__dirname, 'reconciliation-builder.js'), {
        workerData: {
            database: configs.get('database'),
            reconciliation: {
                id: createdReconciliation.id
            }
        }
    });
    worker.once('message', (message) => {
        pushService.administrator.pushUpdate('reconciliation', { id: createdReconciliation.id, isGenerating: false });
        logger.info(`Reconciliation-${createdReconciliation.id}: ${message}`);
    });
    worker.once('error', (err) => {
        logger.error(`Reconciliation-${createdReconciliation.id}: ${err.message}`);
    });

    return res.status(201).json({
        reconciliation: createdReconciliation
    });
};

export const deleteReconciliation = async (req, res) => {
    const { identity: reconciliationId } = req.params;

    const deleteResult = await reconciliationModel.deleteById(reconciliationId);
    if (!deleteResult) throw new HttpErrors.NotFound();

    await fs.unlink(`./reconciliations/${reconciliationId}.csv`);

    return res.status(200).end();
};

export const downloadReconciliation = async (req, res) => {
    const { identity: reconciliationId } = req.params;
    return res.status(200).download(`./reconciliations/${reconciliationId}.csv`, 'Reconciliation.csv');
};
