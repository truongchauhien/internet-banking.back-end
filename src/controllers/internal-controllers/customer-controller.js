import bcrypt from 'bcrypt';
import _ from 'lodash';
import HttpErrors from '../extensions/http-errors.js';
import generateSecret from '../../modules/otp/generate-secret.js';
import * as customerModel from '../../models/customer-model.js';

export const createCustomer = async (req, res) => {
    const customer = _.pick(req.body, ['userName', 'password', 'fullName', 'email', 'phone']);
    customer.password = await bcrypt.hash(customer.password, 12);
    customer.otpSecret = await generateSecret();
    const createdCustomer = await customerModel.createCustomer(customer);
    delete createdCustomer['password'];
    delete createdCustomer['otpSecret'];
    return res.status(201).json({
        customer: createdCustomer
    });
};

export const createPasswordChangeForCustomer = async (req, res) => {
    const { customerId: forCustomerId } = req.params;
    const { userId: customerId } = req.auth;
    if (forCustomerId != customerId) throw new HttpErrors.Forbidden();

    const customer = await customerModel.getById(forCustomerId);
    const { oldPassword, newPassword } = req.body;

    if (!await bcrypt.compare(oldPassword, customer.password)) throw new HttpErrors.Forbidden();
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await customerModel.update(customer.id, {
        password: hashedPassword
    });

    return res.status(200).end();
};
