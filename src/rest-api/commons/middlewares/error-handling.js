import HttpError from '../errors/http-error.js';
import MySqlError from '../../../modules/database/mysql-error.js';
import ERRORS from '../errors/error-meta.js';
import logger from '../../../modules/logger/logger.js';
import TransactionCanceled from '../../../models/extensions/transaction-canceled.js';

/**
 * Error Handler Middleware.  
 * Processing all unhandled errors from controllers and other middlewares.
 * @param {Request} req
 * @param {Response} res
 */
export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof HttpError) {
        res.status(err.code);
        if (err.meta === undefined || err.meta === null) {
            return res.end();
        }
        if (typeof err.meta === 'string') {
            return res.json({
                error: {
                    message: err.meta
                }
            });
        } else {
            return res.json({
                error: err.meta
            });
        }
    } else if (err instanceof MySqlError) {
        logger.error(JSON.stringify(err));
        switch (err.code) {
            case 'ER_DUP_ENTRY':
                return res.status(400).json({
                    error: ERRORS[1001]
                });
            default:
                return res.status(500).end();
        }
    } else if (err instanceof TransactionCanceled) {
        logger.error(JSON.stringify(err));
        if (err.meta === undefined || err.meta === null) {
            return res.status(400).end();
        } else if (typeof err.meta === 'string') {
            return res.status(400).json({
                error: {
                    message: err.meta
                }
            });
        } else {
            return res.status(400).json({
                error: err.meta
            });
        }
    } else {
        logger.error(err.name + '\n' + err.message + '\n' + err.stack);
        return res.status(500).end();
    }
};

export default errorHandler;
