import { HttpError, HttpErrorClasses } from '../controllers/extensions/http-error.js';
import { MySqlError } from '../database/mysql-error.js';
import logger from '../modules/logger/logger.js';

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
        res.status(err.code).end();
    } else if (err instanceof MySqlError) {
        logger.error(err);
        return res.status(500).end();
    } else {
        logger.error(err);
        return res.status(500).end();
    }
};

export default errorHandler;
