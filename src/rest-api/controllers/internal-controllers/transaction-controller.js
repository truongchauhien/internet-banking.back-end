import * as transactionModel from '../../../models/transaction-model.js';
import * as accountModel from '../../../models/account-model.js';
import * as customerModel from '../../../models/customer-model.js';
import HttpErrorClasses from '../extensions/http-errors.js';

export const getOwnTransactions = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { accountId, startingAfter: rawStartingAfter } = req.query;

    if (!accountId) throw new HttpErrorClasses.BadRequest();
    const account = await accountModel.getById(accountId);
    if (!account)
        throw new HttpErrorClasses.NotFound();
    if (customerId !== account.customerId)
        throw new HttpErrorClasses.Forbidden();

    const startingAfter = Number.parseInt(rawStartingAfter) || null;
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
    const { userName, startingAfter: rawStartingAfter } = req.query;

    if (!userName) throw new HttpErrorClasses.BadRequest();
    const customer = await customerModel.getByUserName(userName);
    if (!customer) throw new HttpErrorClasses.NotFound();

    const startingAfter = Number.parseInt(rawStartingAfter) || null;
    const limit = 5;
    const transactions = await transactionModel.findByCustomerId(customer.id, limit + 1, startingAfter);

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
