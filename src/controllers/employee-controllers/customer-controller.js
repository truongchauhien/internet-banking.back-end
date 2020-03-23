import _ from 'lodash';
import * as customerModel from '../../models/customer-model.js';

/**
 * 
 * @param {Request} req
 * @param {Response} res
 */
export const createCustomer = async (req, res) => {
    const customer = _.pick(req.body, ['userName', 'password', 'email', 'fullName']);
    const currentAccountNumber = await customerModel.createCustomer(customer);
    // currentAccountNumber: Số tài khoản vãng lai.
    return res.status(201).json({
        ...customer,
        currentAccountNumber
    })
};
