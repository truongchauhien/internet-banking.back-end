import fs from 'fs';
import bcrypt from 'bcrypt';
import openpgp from 'openpgp';
import pgpService from '../../../modules/pgp-service/index.js';
import HttpErrors from '../../commons/errors/http-errors.js';
import bankingApiModules from '../../../modules/banking-api-modules/banking-api-modules.js';
import * as bankModel from '../../../models/bank-model.js';
import * as currencyModel from '../../../models/currency-model.js';
import * as accountModel from '../../../models/account-model.js';
import * as customerModel from '../../../models/customer-model.js';
import * as transferModel from '../../../models/transfer-model.js';

/*
{
    request: {
        payload: {
            fromAccountNumber: '700000000001',
            toAccountNumber: '1000000001',
            amount: 1000000,
            currency: 'VND', // ISO 4217 Code
            message: 'Your reward.'
        },
        meta: {
            partnerCode: 'ISSUED_PARTNER_CODE',
            createdAt: '2020-05-18T22:14:26.184Z'
        }
    },
    hash: 'BCrypt hash string of `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${createdAt}|${secretKey}`',
    signature: 'PGP signature of clear text `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${createdAt}`'
}
*/

/*
{
    response: {
        payload: {
            request: {
                payload: {
                    fromAccountNumber: '0000000001',
                    toAccountNumber: '0000004001',
                    amount: 1000000,
                    currency: 'VND',
                    message: 'Your reward.'
                },
                meta: {
                    partnerCode: 'ISSUED_PARTNER_CODE',
                    createdAt: '2020-05-18T22:14:26.184Z'
                }
            }
        },
        meta: {
            createdAt: '2020-05-18T22:15:00.000Z'
        }
    },
    hash: 'BCrypt hash string of `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${request_createdAt}|${response_createdAt}|${secretKey}',
    signature: 'PGP signature of clear text `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${request_createdAt}|${response_createdAt}'
}
*/

export const createTransfer = async (req, res) => {
    if (!req.body.request) throw new HttpErrors.BadRequest('Missing body.request.');
    if (!req.body.request.payload) throw new HttpErrors.BadRequest('Missing body.request.payload.');
    if (!req.body.request.meta) throw new HttpErrors.BadRequest('Missing body.request.meta.');

    const { fromAccountNumber, toAccountNumber, amount, currency, message } = req.body.request.payload;
    const { partnerCode, createdAt: rawCreatedAt } = req.body.request.meta;

    if (!fromAccountNumber || !toAccountNumber) throw new HttpErrors.BadRequest('Bad account.');
    if (!amount || typeof amount !== 'number' || amount <= 0) throw new HttpErrors.BadRequest('Bad amount.');
    if (message === null || message === undefined) throw new HttpErrors.BadRequest('Bad message.');
    if (!partnerCode) throw new HttpErrors.BadRequest('Bad partner code');
    if (!req.body.hash) throw new HttpErrors.BadRequest('Bad hash.');
    if (!req.body.signature) throw new HttpErrors.BadRequest('Bad signature.');

    // Checking created time of the request.
    let createdAt;
    if (typeof rawCreatedAt === 'number') {
        createdAt = new Date(rawCreatedAt * 1000);
    } else if (typeof rawCreatedAt === 'string') {
        createdAt = new Date(rawCreatedAt);
    } else {
        throw new HttpErrors.BadRequest('Bad createdAt.');
    }

    if (Number.isNaN(createdAt.getTime())) throw new HttpErrors.BadRequest('Bad createdAt.');
    const timeDiffInMinutes = Math.round((Date.now() - createdAt.getTime()) / 1000 / 60);
    if (timeDiffInMinutes < 0 || timeDiffInMinutes > 5) throw new HttpErrors.BadRequest('The request is expired.');

    // Checking who is requesting.
    const bankIssuedRequest = await bankModel.getByPartnerCode(partnerCode);
    if (!bankIssuedRequest) throw new HttpErrors.BadRequest('The partner code is invalid.');

    // Checking integrity of the request.
    const secretKey = bankIssuedRequest.secretKey;
    if (!secretKey) throw new HttpErrors.InternalServerError('Secret key is not available.');

    const stringToHash = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${rawCreatedAt}|${secretKey}`;
    const checkHashResult = await bcrypt.compare(stringToHash, req.body.hash);
    if (!checkHashResult) throw new HttpErrors.BadRequest('The hash is invalid.');

    // Verifying the issuer of the request.
    const bankingApiModule = bankingApiModules[bankIssuedRequest.id];
    const stringToSign = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${rawCreatedAt}`;
    const isSignatureValid = await bankingApiModule.verify(stringToSign, req.body.signature);
    if (!isSignatureValid) throw new HttpErrors.BadRequest('The signature is invalid.');

    // Checking received account.
    const toAccount = await accountModel.getByAccountNumber(toAccountNumber);
    if (!toAccount) throw new HttpErrors.BadRequest('The received account number does not exist.');
    const toCustomer = await customerModel.getById(toAccount.customerId);
    if (!toCustomer) throw new HttpErrors.InternalServerError('Oops.');

    const fromCurrency = await currencyModel.getByCode(currency);
    if (!fromCurrency) throw new HttpErrors.BadRequest('The currency code is invalid, or is not supported.');

    await transferModel.createIncomingInterbankTransfer({
        fromAccountNumber: fromAccountNumber,
        fromBankId: bankIssuedRequest.id,
        toAccountNumber: toAccount.accountNumber,
        amount: amount,
        currencyId: fromCurrency.id,
        message: message
    });

    const returnResult = {
        response: {
            payload: {
                request: req.body.request
            },
            meta: {
                createdAt: new Date()
            },
        },
        hash: '',
        signature: ''
    };

    const requestCreatedAt = rawCreatedAt;
    const responseCreatedAt = returnResult.response.meta.createdAt.toISOString();
    const responsePreHashString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${requestCreatedAt}|${responseCreatedAt}|${secretKey}`;
    returnResult.hash = await bcrypt.hash(responsePreHashString, 10);
    const responsePreSignString = `${fromAccountNumber}|${toAccountNumber}|${amount}|${currency}|${partnerCode}|${requestCreatedAt}|${responseCreatedAt}`;
    returnResult.signature = await pgpService.sign(responsePreSignString);

    return res.status(200).json(returnResult);
};
