import HttpErrors from '../../commons/errors/http-errors.js';
import * as depositModel from '../../../models/deposit-model.js';
import * as accountModel from '../../../models/account-model.js';
import * as customerModel from '../../../models/customer-model.js';

export const createDeposit = async (req, res) => {
    const { userName, accountNumber, amount } = req.body;

    let accountId;
    if (userName) {
        const customer = await customerModel.getByUserName(userName)
        if (!customer) throw new HttpErrors.NotFound();
        const currentAccount = await accountModel.getCurrentAccountByCustomerId(customer.id);
        accountId = currentAccount.id;
    } else if (accountNumber) {
        const account = await accountModel.getByAccountNumber(accountNumber);
        if (!account) throw new HttpErrors.NotFound();
        accountId = account.id;
    } else {
        throw new HttpErrors.BadRequest();
    }

    const deposit = {
        amount,
        accountId
    };

    const createdDeposit = await depositModel.create(deposit);
    const modifiedAccount = await accountModel.getById(accountId);

    return res.status(201).json({
        deposit: createdDeposit,
        account: modifiedAccount,
        balance: modifiedAccount.balance
    });
};
