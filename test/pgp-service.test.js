import pgpService, { setup as setupPGPService } from '../src/modules/pgp-service/index.js';
import openpgp from 'openpgp';

import chai from 'chai';
const expect = chai.expect;

describe(('PGP Service Tests'), () => {
    before(async () => {
        await setupPGPService();
    });

    describe('sign', () => {
        it('It should be OK.', async () => {
            const signature = await pgpService.sign('Hello World!');
            const valid = await pgpService.verify('Hello World!', signature);
            expect(valid).equals(true);
        });
    });

    describe('verify', () => {
        it('It should be OK.', async() => {
            const signature = await pgpService.sign('Hello World!');
            const valid = await pgpService.verify('Hello World!', signature);
            expect(valid).equals(true);
        });
    });
});
