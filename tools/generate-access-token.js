import jwt from 'jsonwebtoken';
import config from '../src/configs/configs.js';

const TOKEN_SECRET_KEY = config.get('tokenSecretKey');

const generateAccessToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, TOKEN_SECRET_KEY, { expiresIn: '1d' }, (err, encoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(encoded);
            }
        })
    });
};

generateAccessToken({ userType: 'customer', userId: 1 }).then(token => {
    console.log(token);
}, err => {
    console.log(err);
});
