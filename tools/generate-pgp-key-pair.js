import openpgp from 'openpgp';
import { promises as fs } from 'fs';

const { writeFile } = fs;

(async () => {
    const { publicKeyArmored, privateKeyArmored, revocationCertificate } = await openpgp.generateKey({
        userIds: [{ name: 'Truong Chau Hien', email: 'truongchauhien@gmail.com' }],
        rsaBits: 4096
    });

    await Promise.all([
        writeFile('pgp.public.key', publicKeyArmored),
        writeFile('pgp.private.key', privateKeyArmored),
        writeFile('pgp.evocation.key', revocationCertificate)
    ]);
})();
