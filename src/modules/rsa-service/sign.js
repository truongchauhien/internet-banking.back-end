import crypto from 'crypto';
import keyPair from './keys.js';

/**
 * 
 * @param {string} cleartext 
 * @param {object} options
 * @param {'SHA256'|'SHA512'} options.hashAlgorithm
 * @param {'base64'|'hex'} options.signatureFormat
 */
export const sign = async (cleartext, options) => {
    const sign = crypto.createSign(options?.hashAlgorithm || 'SHA256');
    sign.update(cleartext);
    sign.end();
    const signature = sign.sign(keyPair.privateKey, options?.signatureFormat || 'base64');
    return signature;
};

export default sign;
