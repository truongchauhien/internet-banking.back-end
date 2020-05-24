import bcrypt from 'bcrypt';
import HttpErrors from '../../commons/errors/http-errors.js';
import * as bankModel from '../../../models/bank-model.js';
import * as accountModel from '../../../models/account-model.js';
import * as customerModel from '../../../models/customer-model.js';

/*
{
    request: {
        payload: {
            accountNumber: '0123456789'
        },
        meta: {
            partnerCode: 'THE_PARTNER_CODE',
            createdAt: '2020-05-18T10:38:24.431Z'  // UTC time as ISO 8601 format (string), or Unix timestamp in seconds (number).
        }
    },
    hash: 'BCrypt hash string of `${accountNumber}|${partnerCode}|${createdAt}|${secretKey}`,
}
*/

/*
{
    response: {
        payload: {
            accountNumber: '',
            holderName: ''
        },
        meta: {
            createdAt: '2020-05-18T10:38:24.431Z'
        }
    },
    hash: '_ _ _ _'
}
*/

export const getAccount = async (req, res) => {
    if (!req.body.request) throw new HttpErrors.BadRequest('Missing body.request.');
    if (!req.body.request.payload) throw new HttpErrors.BadRequest('Missing body.request.payload.');
    if (!req.body.request.meta) throw new HttpErrors.BadRequest('Missing body.request.meta.');
    const { accountNumber } = req.body.request.payload;
    const { partnerCode, createdAt: rawCreatedAt } = req.body.request.meta;

    if (!accountNumber) throw new HttpErrors.BadRequest('Bad account number.');
    if (!partnerCode) throw new HttpErrors.BadRequest('Bad partner code.');

    // Checking created time of the request.
    let createdAt;
    if (typeof rawCreatedAt === 'number') {
        createdAt = new Date(rawCreatedAt * 1000);
    } else if (typeof rawCreatedAt === 'string') {
        createdAt = new Date(rawCreatedAt);
    } else {
        throw new HttpErrors.BadRequest('createdAt value is invalid.');
    }
    if (Number.isNaN(createdAt.getTime())) throw new HttpErrors.BadRequest('Bad created at.');
    const timeDiffInMinutes = Math.abs(
        Math.round((Date.now() - createdAt.getTime()) / 1000 / 60)
    );
    if (timeDiffInMinutes > 5) throw new HttpErrors.BadRequest('The request is expired.');

    // Checking who is requesting.
    const bankIssueRequest = await bankModel.getByPartnerCode(partnerCode);
    if (!bankIssueRequest) throw new HttpErrors.BadRequest('The partner code is invalid.');

    // Checking integrity of the request.
    const secretKey = bankIssueRequest.secretKey;
    if (!secretKey) throw new HttpErrors.InternalServerError('Secret key is not available.');

    const stringToHash = `${accountNumber}|${partnerCode}|${rawCreatedAt}|${secretKey}`;
    const checkHashResult = await bcrypt.compare(stringToHash, req.body.hash);
    if (!checkHashResult) throw new HttpErrors.BadRequest('The hash is wrong!');

    // Checking account number.
    const account = await accountModel.getByAccountNumber(accountNumber);
    if (!account) throw new HttpErrors.BadRequest('The account number does not exist.');
    const customer = await customerModel.getById(account.customerId);
    if (!customer) throw new HttpErrors.InternalServerError('Oops.');

    const returnResult = {
        response: {
            payload: {
                accountNumber: account.accountNumber,
                holderName: customer.fullName
            },
            meta: {
                createdAt: (new Date()).toISOString()
            }
        },
        hash: ''
    };

    {
        const accountNumber = returnResult.response.payload.accountNumber;
        const holderName = returnResult.response.payload.holderName;
        const responseCreatedAt = returnResult.response.meta.createdAt;
        const responsePreHashString = `${accountNumber}|${holderName}|${responseCreatedAt}|${secretKey}`;
        returnResult.hash = await bcrypt.hash(responsePreHashString, 10);
    }

    // Return result for requester.
    return res.status(200).json(returnResult);
};
