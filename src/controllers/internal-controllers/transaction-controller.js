import * as transactionModel from '../../models/transaction-model.js';
import HttpErrorClasses from '../extensions/http-errors.js';

export const getTransactions = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { accountNumber, fromTime, toTime, pageNumber: rawPageNumber } = req.query;

    let pageNumber = Number.parseInt(rawPageNumber) || 1;
    if (pageNumber <= 0) throw new HttpErrorClasses
    const account = await accountModel.getAccount(accountNumber);

    if (!account)
        throw new HttpErrorClasses.NotFound();
    if (customerId !== account.customerId)
        throw new HttpErrorClasses.Forbidden();

    const transactions = await transactionModel.findByAccountNumber(accountNumber, fromTime, toTime, 10, pageNumber);

    return res.status(200).json({
        transactions: transactions
    });
};
