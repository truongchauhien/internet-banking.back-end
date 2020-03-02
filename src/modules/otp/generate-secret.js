import { randomBytes } from 'crypto';
import base32Encode from 'base32-encode';
import base32Decode from 'base32-decode';

export const generateSecret = () => {
    return new Promise((resolve, reject) => {
        randomBytes(10, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(base32Encode(buffer, 'RFC4648', { padding: false }));
            }
        });
    });
};

export const decodeSecret = (secret) => {
    return base32Decode(secret, 'RFC4648');
};
