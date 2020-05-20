import openpgp from 'openpgp';
import keyPair from './keys.js';

export const sign = async (cleartext) => {
    const { signature: detachedSignature } = await openpgp.sign({
        message: openpgp.cleartext.fromText(cleartext),
        privateKeys: [keyPair.privateKey],
        detached: true
    });

    return detachedSignature;
};

export default sign;
