import * as accountModel from '../../../models/account-model.js';
import HttpErrors from '../extensions/http-errors.js';
import bankingApiModules from '../../../modules/banking-api-modules/banking-api-modules.js';

export const getAccountsForCustomer = async (req, res) => {
    const { userId } = req.auth;
    const { customerId } = req.query;

    if (!customerId) throw new HttpErrors.BadRequest();
    if (userId != customerId) throw new HttpErrors.Forbidden();
    const accounts = await accountModel.getAllByCustomerId(customerId);

    return res.status(200).json({
        accounts: accounts
    });
};

export const getAccountsForEmployee = async (req, res) => {
    const { customerId } = req.query;
    const accounts = await accountModel.getAllByCustomerId(customerId);

    return res.status(200).json({
        accounts: accounts
    });
};

export const getAccountForCustomer = (req, res) => {
    const { bankId } = req.query;

    if (bankId) {
        return getInternalAccountForCustomer(req, res);
    }

    return getExternalAccountForCustomer(req, res);
};

async function getInternalAccountForCustomer(req, res) {
    const { userId: customerId } = req.auth;
    const { identityType = 'id' } = req.query;
    const { identity } = req.params;

    let account;
    switch (identityType) {
        case 'id':
            account = await accountModel.getById(identity);
            break;
        case 'accountNumber':
            account = await accountModel.getByAccountNumber(identity);
            break;
        default:
            throw new HttpErrors.BadRequest();
    }

    if (!account) throw new HttpErrors.NotFound();
    if (customerId !== account.customerId) {
        account = _.pick(account, ['id', 'accountNumber', 'fullName']);
    }
    account.holderName = account.fullName;

    return res.status(200).json({
        account: account
    });
}

async function getExternalAccountForCustomer(req, res) {
    const { identity: accountNumber } = req.params;
    const { bankId, identityType = 'accountNumber' } = req.query;

    if (identityType !== 'accountNumber') throw new HttpErrors.BadRequest();

    const bankingApiModule = bankingApiModules[bankId];
    if (!bankingApiModule) throw new HttpErrors.BadRequest();

    const account = await bankingApiModule.getAccount({ accountNumber: accountNumber });
    if (!account) throw new HttpErrors.NotFound();

    return res.status(200).json({
        account: foundAccount
    });
}
