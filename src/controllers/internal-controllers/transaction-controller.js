import * as transactionModel from '../../models/transaction-model.js';
import * as accountModel from '../../models/account-model.js';
import HttpErrorClasses from '../extensions/http-errors.js';

export const getOwnTransactions = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { accountId, startingAfter: rawStartingAfter } = req.query;

    const startingAfter = Number.parseInt(rawStartingAfter) || null;

    const account = await accountModel.getById(accountId);
    if (!account)
        throw new HttpErrorClasses.NotFound();
    if (customerId !== account.customerId)
        throw new HttpErrorClasses.Forbidden();

    const limit = 1;
    const transactions = await transactionModel.findByAccountId(account.id, limit + 1, startingAfter);

    let hasMore = false;
    if (Array.isArray(transactions) && transactions.length > limit) {
        transactions.pop();
        hasMore = true;
    }

    return res.status(200).json({
        transactions: transactions,
        hasMore
    });
};

export const getTransactions = async (req, res) => {
    const { accountId, startingAfter: rawStartingAfter } = req.query;

    const startingAfter = Number.parseInt(rawStartingAfter) || null;

    const account = await accountModel.getById(accountId);
    if (!account)
        throw new HttpErrorClasses.NotFound();

    const limit = 10;
    const transactions = await transactionModel.findByAccountId(account.id, limit + 1, startingAfter);

    let hasMore = false;
    if (Array.isArray(transactions) && transactions.length > limit) {
        transactions.pop();
        hasMore = true;
    }

    return res.status(200).json({
        transactions: transactions,
        hasMore
    });
};
