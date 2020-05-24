import * as transactionModel from '../../../models/transaction-model.js';
import * as accountModel from '../../../models/account-model.js';
import * as customerModel from '../../../models/customer-model.js';
import HttpErrors from '../../commons/errors/http-errors.js';

export const getTransactionsForCustomer = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { accountId, startingAfter: rawStartingAfter } = req.query;

    if (!accountId) throw new HttpErrors.BadRequest();
    const account = await accountModel.getById(accountId);
    if (!account)
        throw new HttpErrors.NotFound();
    if (customerId !== account.customerId)
        throw new HttpErrors.Forbidden();

    const startingAfter = Number.parseInt(rawStartingAfter) || null;
    const limit = 5;
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

export const getTransactionsForEmployee = async (req, res) => {
    const { userName, startingAfter: rawStartingAfter } = req.query;

    if (!userName) throw new HttpErrors.BadRequest();
    const customer = await customerModel.getByUserName(userName);
    if (!customer) throw new HttpErrors.NotFound();

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
