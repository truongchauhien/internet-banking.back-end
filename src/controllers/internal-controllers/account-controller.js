import * as accountModel from '../../models/account-model.js';
import HttpErrors from '../extensions/http-errors.js';

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

export const getAccountForCustomer = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { identityValue } = req.params;
    const { identityType = 'id' } = req.query;

    let account;
    switch (identityType) {
        case 'id':
            account = await accountModel.getById(identityValue);
            break;
        case 'accountNumber':
            account = await accountModel.getByAccountNumber(identityValue);
            break;
        default:
            throw new HttpErrors.BadRequest();
    }

    if (!account) throw new HttpErrors.NotFound();
    if (customerId !== account.customerId) throw new HttpErrors.Forbidden();

    return res.status(200).json(account);
};
