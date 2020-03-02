import jwt from 'jsonwebtoken';
import config from '../configs/config-schema.js';

const TOKEN_SECRET_KEY = config.get('tokenSecretKey');

/**
 * 
 * @param {Request} req
 * @param {Response} res
 */
export const verifyAccessToken = async (req, res, next) => {
    const { authenticationHeader } = req.header('Authentication');
    const [authenticationSchema, accessToken] = authenticationHeader.split(' ');
    if (authenticationSchema !== 'Bearer') {
        return res.status(401).json({
            message: 'Invalid authentication schema.'
        });
    }

    const [result, error, decoded] = await (new Promise((resolve, reject) => {
        jwt.verify(accessToken, TOKEN_SECRET_KEY, (err, decoded) => {
            if (err) {
                reject([false, err, decoded]);
            } else {
                resolve([true, err, decoded]);
            }
        });
    }));

    if (!result) {
        return res.status(401).json({
            message: 'Invalid access token.'
        });
    }

    next();
};

export default verifyAccessToken;
