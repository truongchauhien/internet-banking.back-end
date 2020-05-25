import crypto from 'crypto';
import keyPair from './keys.js';

/**
 * 
 * @param {string} cleartext 
 * @param {string} signature 
 * @param {object} options
 * @param {'SHA256'|'SHA512'} options.hashAlgorithm
 * @param {'base64'|'hex'} options.signatureFormat
 */
export const verify = async (cleartext, signature, options) => {
    const verify = crypto.createVerify(options?.hashAlgorithm || 'SHA256');
    verify.update(cleartext);
    verify.end();
    const valid = verify.verify(keyPair.publicKey, signature, options?.signatureFormat || 'base64');
    return valid;
};

export default verify;
