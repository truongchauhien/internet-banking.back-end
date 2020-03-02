import createError from 'http-errors';

/**
 * 
 * @param {Request} req
 * @param {Response} res
 */
export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof createError.HttpError) {
        res.status(err.status);
        if (err.expose) {
            if (typeof (err.message) === 'string' || err.message instanceof String) {
                return res.json({ message: err.message });
            } else {
                return res.json(err.message);
            }
        } else {
            return res.json({ message: 'Oops!' });
        }
    } else {
        return res.status(500).json({ message: 'Oops!' });
    }
};

export default errorHandler;
