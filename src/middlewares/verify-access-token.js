import jwt from 'jsonwebtoken';
import _ from 'lodash';
import config from '../configs/config-schema.js';
import { HttpErrorClasses } from '../controllers/extensions/http-error.js';

const TOKEN_SECRET_KEY = config.get('tokenSecretKey');

/**
 * 
 * @param {Request} req
 * @param {Response} res
 */
export const verifyAccessToken = async (req, res, next) => {
    const authenticationHeader = req.header('Authentication') || req.header('Authorization');
    if (!authenticationHeader) throw new HttpErrorClasses.Unauthorized();

    const [authenticationSchema, accessToken] = authenticationHeader.split(' ');
    if (authenticationSchema !== 'Bearer') throw new HttpErrorClasses.Unauthorized();

    let decoded;
    try {
        decoded = await (new Promise((resolve, reject) => {
            jwt.verify(accessToken, TOKEN_SECRET_KEY, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        }));
    } catch (err) {
        // Invalid access token.
        throw new HttpErrorClasses.Unauthorized();
    }

    req.auth = _.pick(decoded, ['userId', 'userType']);

    next();
};

export default verifyAccessToken;
