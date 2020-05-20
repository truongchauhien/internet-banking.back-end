import openpgp from 'openpgp';
import keyPair from './keys.js';

export const verify = async (cleartext, detachedSignature) => {
    const verified = await openpgp.verify({
        message: openpgp.cleartext.fromText(cleartext),
        signature: await openpgp.signature.readArmored(detachedSignature),
        publicKeys: [keyPair.publicKey]
    });

    const {valid } = verified.signatures[0];
    return valid;
};

export default verify;
