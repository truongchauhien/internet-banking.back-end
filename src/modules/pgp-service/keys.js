import fs from 'fs';
import openpgp from 'openpgp';

const PGP_PRIVATE_KEY_ARMORED = fs.readFileSync('./keys/pgp.private.key', 'utf-8');
const PGP_PUBLIC_KEY_ARMORED = fs.readFileSync('./keys/pgp.public.key', 'utf-8');

export const keyPair = {
    privateKey: null,
    publicKey: null
};

export async function setup() {
    ({ keys: [keyPair.privateKey] } = await openpgp.key.readArmored(PGP_PRIVATE_KEY_ARMORED));
    ({ keys: [keyPair.publicKey] } = await openpgp.key.readArmored(PGP_PUBLIC_KEY_ARMORED));
}

export default keyPair;
