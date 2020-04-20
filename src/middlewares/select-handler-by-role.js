import HttpErrors from '../controllers/extensions/http-errors.js';

/**
 * 
 * @param {object} handlers
 * @param {function} handlers.customer
 * @param {function} handlers.employee
 * @param {function} handlers.administrator
 */
export const selectHandlerByRole = (handlers) => {
    return (req, res, next) => {
        const { userType } = req.auth;
        const handler = handlers[userType];
        if (!handler || typeof handler !== 'function' || handler.length < 2) throw new HttpErrors.Forbidden();
        handler(req, res, next);
    };
};

export default selectHandlerByRole;
