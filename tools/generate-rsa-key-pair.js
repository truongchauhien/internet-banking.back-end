import crypto from 'crypto';
import { promises as fs } from 'fs';

(async () => {
    const [publicKey, privateKey] = await (new Promise((resolve, reject) => {
        crypto.generateKeyPair('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        }, (err, publicKey, privateKey) => {
            if (err) {
                reject(err);
            } else {
                resolve([publicKey, privateKey]);
            }
        });
    }));

    await Promise.all([
        fs.writeFile('rsa.public.key', publicKey),
        fs.writeFile('rsa.private.key', privateKey)
    ]);
})();
