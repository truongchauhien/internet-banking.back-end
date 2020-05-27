import fs from 'fs';
import bcrypt from 'bcrypt';
import mysql from 'mysql';
import configs from '../src/modules/configs/configs.js';
import { pool } from '../src/modules/database/mysql-db.js';
import pgpService, { setup as setupPGPService } from '../src/modules/pgp-service/index.js';
import rsaService from '../src/modules/rsa-service/index.js';
import { setup as setupBankingApiModules } from '../src/modules/banking-api-modules/banking-api-modules.js';
import { transporter } from '../src/modules/mail/mailer.js';
import restApi from '../src/rest-api/index.js';

import chai from 'chai';
import chaiHttp from 'chai-http';

// https://www.chaijs.com/guide/styles/#should
// chai.should();
// https://www.chaijs.com/guide/styles/#expect
const expect = chai.expect;
chai.use(chaiHttp);

describe(('Public API Tests'), () => {
    before(async () => {
        // Setup testing database.
        const mysqlConnection = mysql.createConnection({
            host: configs.get('database.host'),
            port: configs.get('database.port'),
            user: configs.get('database.user'),
            password: configs.get('database.password'),
            database: configs.get('database.name'),
            multipleStatements: true
        });
        await (new Promise((resolve, reject) => {
            mysqlConnection.connect((error) => {
                if (error) return reject(error);
                resolve();
            });
        }));
        const databaseCreationSQLScript = fs.readFileSync('./database.testing.sql', 'utf-8');
        await (new Promise((resolve, reject) => {
            mysqlConnection.query(databaseCreationSQLScript, (error, results, fields) => {
                if (error) return reject(error);
                resolve(results);
            });
        }));
        await (new Promise((resolve, reject) => {
            mysqlConnection.end((error) => {
                if (error) return reject(error);
                resolve();
            });
        }));
        // End setup tesing database.

        await setupBankingApiModules();
        await setupPGPService();
    });

    describe('/public-api/accounts', () => {
        it('It should be OK.', async () => {
            const body = {
                request: {
                    payload: {
                        accountNumber: '1000000001'
                    },
                    meta: {
                        partnerCode: 'PARTNER_CODE_FOR_BANK_X',
                        createdAt: new Date()
                    }
                },
                hash: ''
            };

            {
                const accountNumber = body.request.payload.accountNumber;
                const createdAt = body.request.meta.createdAt.toISOString();
                const partnerCode = body.request.meta.partnerCode;
                const secretKey = 'SECRET_KEY_FOR_BANK_X';
                body.hash = await bcrypt.hash(`${accountNumber}|${partnerCode}|${createdAt}|${secretKey}`, 10);
            }

            const res = await chai.request(restApi)
                .post('/public-api/accounts')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(body));

            expect(res).to.have.status(200);

            {
                const responseBody = res.body;
                const accountNumber = responseBody.response.payload.accountNumber;
                const holderName = responseBody.response.payload.holderName;
                const createdAt = responseBody.response.meta.createdAt;
                const secretKey = 'SECRET_KEY_FOR_BANK_X';
                const preHashString = `${accountNumber}|${holderName}|${createdAt}|${secretKey}`;
                const isHashValid = await bcrypt.compare(preHashString, responseBody.hash);
                expect(isHashValid).to.equal(true);
            }
        });
    });

    describe('/public-api/transfers', () => {
        describe('Signature Algorithm: RSA', () => {
            it('It should be OK.', async () => {
                const requestBody = {
                    request: {
                        payload: {
                            fromAccountNumber: '700000000001',
                            toAccountNumber: '1000000001',
                            amount: 100000,
                            currency: 'VND',
                            message: 'Your reward.'
                        },
                        meta: {
                            partnerCode: 'PARTNER_CODE_FOR_BANK_X',
                            createdAt: (new Date()).toISOString()
                        }
                    },
                    hash: '',
                    signature: ''
                }

                {
                    const fromAccountNumber = requestBody.request.payload.fromAccountNumber;
                    const toAccountNumber = requestBody.request.payload.toAccountNumber;
                    const amount = requestBody.request.payload.amount.toString();
                    const currency = requestBody.request.payload.currency;
                    const createdAt = requestBody.request.meta.createdAt;
                    const partnerCode = requestBody.request.meta.partnerCode;

                    const secretKey = 'SECRET_KEY_FOR_BANK_X';
                    const preHashString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${createdAt}|${secretKey}`;
                    const preSignString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${createdAt}`;
                    requestBody.hash = await bcrypt.hash(preHashString, 1);
                    requestBody.signature = await pgpService.sign(preSignString);

                }

                const res = await chai.request(restApi)
                    .post('/public-api/transfers')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify(requestBody));

                expect(res).to.have.status(200);

                {
                    const responseBody = res.body;

                    const fromAccountNumber = responseBody.response.payload.request.payload.fromAccountNumber;
                    const toAccountNumber = responseBody.response.payload.request.payload.toAccountNumber;
                    const amount = responseBody.response.payload.request.payload.amount.toString();
                    const currency = responseBody.response.payload.request.payload.currency;
                    const requestCreatedAt = responseBody.response.payload.request.meta.createdAt;
                    const responseCreatedAt = responseBody.response.meta.createdAt;

                    const partnerCode = requestBody.request.meta.partnerCode;
                    const secretKey = 'SECRET_KEY_FOR_BANK_X';
                    const responsePreHashString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${requestCreatedAt}|${responseCreatedAt}|${secretKey}`;
                    const isHashValid = await bcrypt.compare(responsePreHashString, responseBody.hash);
                    expect(isHashValid).to.equal(true);

                    const responsePreSignString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${requestCreatedAt}|${responseCreatedAt}`;
                    const isSignValid = await pgpService.verify(responsePreSignString, responseBody.signature);
                    expect(isSignValid).to.equal(true);
                }
            });
        });
        describe('Signature Algorithm: OpenPGP', () => {
            it('It should be OK.', async () => {
                const requestBody = {
                    request: {
                        payload: {
                            fromAccountNumber: '800000000001',
                            toAccountNumber: '1000000001',
                            amount: 100000,
                            currency: 'VND',
                            message: 'Your reward.'
                        },
                        meta: {
                            partnerCode: 'PARTNER_CODE_FOR_BANK_Y',
                            createdAt: (new Date()).toISOString()
                        }
                    },
                    hash: '',
                    signature: '',
                    signatureAlgorithm: 'RSA'
                }

                {
                    const fromAccountNumber = requestBody.request.payload.fromAccountNumber;
                    const toAccountNumber = requestBody.request.payload.toAccountNumber;
                    const amount = requestBody.request.payload.amount.toString();
                    const currency = requestBody.request.payload.currency;
                    const createdAt = requestBody.request.meta.createdAt;
                    const partnerCode = requestBody.request.meta.partnerCode;

                    const secretKey = 'SECRET_KEY_FOR_BANK_Y';
                    const preHashString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${createdAt}|${secretKey}`;
                    const preSignString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${createdAt}`;
                    requestBody.hash = await bcrypt.hash(preHashString, 1);
                    requestBody.signature = await rsaService.sign(preSignString);
                }

                const res = await chai.request(restApi)
                    .post('/public-api/transfers')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify(requestBody));

                expect(res).to.have.status(200);

                {
                    const responseBody = res.body;

                    const fromAccountNumber = responseBody.response.payload.request.payload.fromAccountNumber;
                    const toAccountNumber = responseBody.response.payload.request.payload.toAccountNumber;
                    const amount = responseBody.response.payload.request.payload.amount.toString();
                    const currency = responseBody.response.payload.request.payload.currency;
                    const requestCreatedAt = responseBody.response.payload.request.meta.createdAt;
                    const responseCreatedAt = responseBody.response.meta.createdAt;

                    const partnerCode = requestBody.request.meta.partnerCode;
                    const secretKey = 'SECRET_KEY_FOR_BANK_Y';
                    const responsePreHashString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${requestCreatedAt}|${responseCreatedAt}|${secretKey}`;
                    const isHashValid = await bcrypt.compare(responsePreHashString, responseBody.hash);
                    expect(isHashValid).to.equal(true);

                    const responsePreSignString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${requestCreatedAt}|${responseCreatedAt}`;
                    const isSignValid = await rsaService.verify(responsePreSignString, responseBody.signature);
                    expect(isSignValid).to.equal(true);
                }
            });
        });
    });

    describe('/public-api/charges', () => {
        it('It should be OK.', async () => {
            const res = await chai.request(restApi)
                .post('/public-api/charges')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify({}));
            expect(res).to.have.status(403);
        });
    });

    after((done) => {
        pool.end();
        transporter.close();
        done();
    });
});
