import bcrypt from 'bcrypt';
import * as customerModel from '../../models/customer-model.js';
import HttpErrors from '../extensions/http-errors.js';

export const createCustomer = async (req, res) => {
    const customer = _.pick(req.body, ['userName', 'password', 'email', 'fullName']);
    const currentAccountNumber = await customerModel.createCustomer(customer);
    // currentAccountNumber: Số tài khoản vãng lai.
    return res.status(201).json({
        ...customer,
        currentAccountNumber
    })
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
