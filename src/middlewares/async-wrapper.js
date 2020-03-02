/**
 * 
 * @param {Function} func 
 */
export const asyncWrapper = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(err => {
            next(err);
        });
    }
};

export default asyncWrapper;
