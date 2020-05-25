import rsaService from '../src/modules/rsa-service/index.js';

import chai from 'chai';
const expect = chai.expect;

describe(('PGP Service Tests'), () => {
    describe('sign', () => {
        it('It should be OK.', async () => {
            const signature = await rsaService.sign('Hello World!');
            const valid = await rsaService.verify('Hello World!', signature);
            expect(valid).equals(true);
        });
    });

    describe('verify', () => {
        it('It should be OK.', async () => {
            const signature = await rsaService.sign('Hello World!');
            const valid = await rsaService.verify('Hello World!', signature);
            expect(valid).equals(true);
        });
    });
});
