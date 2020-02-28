import { generateKeyPair } from 'crypto';
import { promises as fs } from 'fs';
const { writeFile } = fs;

(async () => {
    const [publicKey, privateKey] = await (new Promise((resolve, reject) => {
        generateKeyPair('rsa', {
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
        writeFile('rsa-public.key', publicKey),
        writeFile('rsa-private.key', privateKey)
    ]);
})();
