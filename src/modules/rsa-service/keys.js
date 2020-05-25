import fs from 'fs';
import crypto from 'crypto';

const RSA_PRIVATE_KEY_PEM = fs.readFileSync('./keys/rsa.private.key', 'utf-8');
const RSA_PUBLIC_KEY_PEM = fs.readFileSync('./keys/rsa.public.key', 'utf-8');

const privateKey = crypto.createPrivateKey({
    key: RSA_PRIVATE_KEY_PEM,
    format: 'pem'
});

const publicKey = crypto.createPublicKey({
    key: RSA_PUBLIC_KEY_PEM,
    format: 'pem'
});

export const keyPair = {
    privateKey,
    publicKey
};

export default keyPair;
