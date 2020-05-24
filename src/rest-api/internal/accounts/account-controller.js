import _ from 'lodash';
import HttpErrors from '../../commons/errors/http-errors.js';
import bankingApiModules from '../../../modules/banking-api-modules/banking-api-modules.js';
import * as accountModel from '../../../models/account-model.js';
import * as customerModel from '../../../models/customer-model.js';
import BANKS from '../../../models/constants/banks.js';
import CURRENCIES from '../../../models/constants/currencies.js';
import ACCOUNT_TYPES from '../../../models/constants/account-types.js';

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
    const { customerId, customerUserName } = req.query;

    let accounts;
    if (customerId) {
        accounts = await accountModel.getAllByCustomerId(customerId);
    } else if (customerUserName) {
        accounts = await accountModel.getAllByCustomerId(customerId);
    }
    else {
        throw new HttpErrors.BadRequest();
    }

    return res.status(200).json({
        accounts: accounts
    });
};

export const getAccountHolderInformationForCustomer = (req, res) => {
    const { bankId } = req.query;
    if (!bankId || bankId == BANKS.INTERNAL) return getInternalAccountHolderInformationForCustomer(req, res);
    return getExternalAccountHolderInformationForCustomer(req, res);
};

async function getInternalAccountHolderInformationForCustomer(req, res) {
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
    const customer = await customerModel.getById(account.customerId);
    if (!customer) throw new HttpErrors.InternalServerError();
    account.holderName = customer.fullName;
    
    if (account.customerId === customerId) {
        // Customer gets its own account, with full information.
        return res.status(200).json({
            account
        });
    } else {
        // Customer gets other customer accounts, with limit information.
        return res.status(200).json({
            account: {
                accountNumber: account.accountNumber,
                holderName: customer.fullName
            }
        });
    }
}

async function getExternalAccountHolderInformationForCustomer(req, res) {
    const { identity: accountNumber } = req.params;
    const { bankId, identityType = 'accountNumber' } = req.query;

    if (identityType !== 'accountNumber') throw new HttpErrors.BadRequest('Get by account number only.');

    // Bank ID is checked in the outer function.
    const bankingApiModule = bankingApiModules[bankId];
    if (!bankingApiModule) throw new HttpErrors.BadRequest('Target bank is not supported.');

    const account = await bankingApiModule.getAccount({ accountNumber: accountNumber });
    if (!account) throw new HttpErrors.NotFound('No account with provided account number.');

    return res.status(200).json({
        account: account
    });
}

export const closeAccount = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { identity: closedAccountId } = req.params;
    const { transferredAccountId } = req.body;

    const customer = await customerModel.getById(customerId);
    const closedAccount = await accountModel.getById(closedAccountId);
    const transferredAccount = await accountModel.getById(transferredAccountId);
    if (closedAccount.customerId !== customer.id) throw new HttpErrors.Forbidden();
    if (transferredAccount.customerId !== customer.id) throw new HttpErrors.Forbidden();
    if (closedAccount.id === transferredAccount.id) throw new HttpErrors.BadRequest();

    await accountModel.closeAccount(closedAccountId, transferredAccountId);
    const updatedTransferredAccount = await accountModel.getById(transferredAccount.id);
    const updatedCustomer = await customerModel.getById(customer.id);

    return res.status(200).json({
        transferredAccount: updatedTransferredAccount,
        customer: {
            defaultCurrentAccountId: updatedCustomer.defaultCurrentAccountId
        }
    });
};

export const createAccount = async (req, res) => {
    const { customerId, type } = req.body;

    let typeId;
    if (type === 'current') {
        typeId = ACCOUNT_TYPES.CURRENT;
    } else if (type === 'deposit') {
        typeId = ACCOUNT_TYPES.DEPOSIT;
    } else {
        throw new HttpErrors.BadRequest('Bad account type.');
    }

    const createdAccount = await accountModel.createAccount({
        customerId,
        currencyId: CURRENCIES.VND,
        typeId
    });

    return res.status(201).json({
        account: createdAccount
    });
};
