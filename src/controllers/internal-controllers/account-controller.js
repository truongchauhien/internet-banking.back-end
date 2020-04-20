import * as accountModel from '../../models/account-model.js';
import * as transactionModel from '../../models/transaction-model.js';
import HttpErrors from '../extensions/http-errors.js';

export const getAccounts = async (req, res) => {
    const { userId: customerId } = req.auth;
    const accounts = await accountModel.getAllByCustomerId(customerId);

    return res.status(200).json({
        accounts: accounts
    });
};

export const getAccount = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { identityValue } = req.params;
    const { identityType } = req.query;

    
    let account;
    switch (identityType) {
        case 'id':
            const account = await accountModel.get(accountNumber);
    }

    
    if (!account) throw new HttpErrors.NotFound();
    if (customerId !== account.customerId) throw new HttpErrors.Forbidden();

    return res.status(200).json(account);
};
