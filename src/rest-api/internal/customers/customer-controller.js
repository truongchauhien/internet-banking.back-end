import bcrypt from 'bcrypt';
import _ from 'lodash';
import HttpErrors from '../../commons/errors/http-errors.js';
import generateSecret from '../../../modules/otp/generate-secret.js';
import ACCOUNT_TYPES from '../../../models/constants/account-types.js';
import * as customerModel from '../../../models/customer-model.js';
import * as accountModel from '../../../models/account-model.js';

export const createCustomer = async (req, res) => {
    const customer = _.pick(req.body, ['userName', 'password', 'fullName', 'email', 'phone']);
    customer.password = await bcrypt.hash(customer.password, 12);
    customer.otpSecret = await generateSecret();
    const { customer: createdCustomer, currentAccount: createdCurrentAccount } = await customerModel.createCustomer(customer);
    delete createdCustomer['password'];
    delete createdCustomer['otpSecret'];
    return res.status(201).json({
        customer: createdCustomer,
        account: createdCurrentAccount
    });
};

export const selfGetCustomer = async (req, res) => {
    const { userId: callerCustomerId } = req.auth;
    const { identity: selfCustomerId } = req.params;

    if (callerCustomerId != selfCustomerId) throw new HttpErrors.Forbidden();
    const customer = await customerModel.getById(selfCustomerId);
    if (!customer) throw new HttpErrors.NotFound();

    return res.status(200).json({
        customer: _.omit(customer, ['password', 'refreshToken', 'otpSecret'])
    });
};

export const getCustomerForEmployee = async (req, res) => {
    const { identity } = req.params;
    const { identityType = 'id' } = req.query;

    let customer;
    switch (identityType) {
        case 'id':
            customer = await customerModel.getById(identity);
            break;
        case 'userName':
            customer = await customerModel.getByUserName(identity);
            break;
        default:
            throw new HttpErrors.BadRequest('Unknown identity type.');
    }

    if (!customer) throw new HttpErrors.NotFound();

    customer = _.omit(customer, ['password', 'otpSecret', 'refreshToken']);

    return res.status(200).json({
        customer: customer
    });
};

export const updatePasswordForCustomer = async (req, res) => {
    const { customerId: forCustomerId } = req.params;
    const { userId: customerId } = req.auth;
    if (forCustomerId != customerId) throw new HttpErrors.Forbidden();

    const customer = await customerModel.getById(forCustomerId);
    const { oldPassword, newPassword } = req.body;

    if (!await bcrypt.compare(oldPassword, customer.password)) throw new HttpErrors.Forbidden();
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await customerModel.updateById(customer.id, {
        password: hashedPassword
    });

    return res.status(204).end();
};

export const setDefaultCurrentAccountForCustomer = async (req, res) => {
    const { userId: callerCustomerId } = req.auth;
    const { customerId: selfCustomerId } = req.params;
    const { currentAccountId } = req.body;

    if (callerCustomerId != selfCustomerId) throw new HttpErrors.Forbidden();

    const customer = await customerModel.getById(selfCustomerId);
    if (customer.defaultCurrentAccountId === currentAccountId) {
        return res.status(204).end();
    }

    const account = await accountModel.getById(currentAccountId);
    if (account.customerId !== customer.id) throw new HttpErrors.Forbidden();
    if (account.typeId !== ACCOUNT_TYPES.CURRENT) throw new HttpErrors.BadRequest();

    await customerModel.updateById(customer.id, {
        defaultCurrentAccountId: account.id
    });

    return res.status(204).end();
};
