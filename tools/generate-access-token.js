import jwt from 'jsonwebtoken';
import configs from '../src/modules/configs/configs.js';

const TOKEN_SECRET_KEY = configs.get('tokenSecretKey');

const generateAccessToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, TOKEN_SECRET_KEY, { expiresIn: '30d' }, (err, encoded) => {
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
