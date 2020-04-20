import * as customerModel from '../../models/customer-model.js';

export const createCustomer = async (req, res) => {
    const customer = _.pick(req.body, ['userName', 'password', 'email', 'fullName']);
    const currentAccountNumber = await customerModel.createCustomer(customer);
    // currentAccountNumber: Số tài khoản vãng lai.
    return res.status(201).json({
        ...customer,
        currentAccountNumber
    })
};
