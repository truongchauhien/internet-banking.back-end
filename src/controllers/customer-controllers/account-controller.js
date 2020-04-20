import * as accountModel from '../../models/account-model.js';
import * as transactionModel from '../../models/transaction-model.js';
import HttpErrors from '../extensions/http-errors.js';

export const getAccounts = async (req, res) => {
    const { userId: customerId } = req.auth;
    const accounts = await accountModel.getAllAccounts(customerId);

    return res.status(200).json({
        accounts: accounts
    });
};

export const getAccountTransactions = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { accountNumber } = req.params;

    const account = await accountModel.getAccount(accountNumber);

    if (!account)
        throw new HttpErrorClasses.NotFound();
    if (customerId !== account.customerId)
        throw new HttpErrorClasses.Forbidden();

    const transactions = await transactionModel.findTransactionByAccountNumber(accountNumber);

    return res.status(200).json({
        accountNumber: accountNumber,
        transactions: transactions
    });
};

export const getAccountByAccountNumber = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { accountNumber } = req.params;

    if (!account) throw new HttpErrors.NotFound();
    if (customerId !== account.customerId) throw new HttpErrors.Forbidden();

    return res.status(200).json(account);
};
