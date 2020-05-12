import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import selectHandlerByRole from '../../commons/middlewares/select-handler-by-role.js';
import * as customerController from './customer-controller.js';

const router = express.Router();

router.post('/', selectHandlerByRole({
    employee: asyncWrapper(customerController.createCustomer)
}));

router.post('/:customerId/password', selectHandlerByRole({
    customer: asyncWrapper(customerController.createPasswordChangeForCustomer)
}));

export default router;
