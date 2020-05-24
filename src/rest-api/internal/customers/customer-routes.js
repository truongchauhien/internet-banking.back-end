import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import selectHandlerByRole from '../../commons/middlewares/select-handler-by-role.js';
import * as customerController from './customer-controller.js';

const router = express.Router();

router.post('/', selectHandlerByRole({
    employee: asyncWrapper(customerController.createCustomer)
}));
router.get('/:identity', selectHandlerByRole({
    customer: asyncWrapper(customerController.selfGetCustomer),
    employee: asyncWrapper(customerController.getCustomerForEmployee)
}));
router.put('/:customerId/password', selectHandlerByRole({
    customer: asyncWrapper(customerController.updatePasswordForCustomer)
}));
router.put('/:customerId/defaultCurrentAccount', selectHandlerByRole({
    customer: asyncWrapper(customerController.setDefaultCurrentAccountForCustomer)
}));

export default router;
