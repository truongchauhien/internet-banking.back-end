import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import selectHandlerByRole from '../../middlewares/select-handler-by-role.js';
import * as customerController from '../../controllers/internal-controllers/customer-controller.js';

const router = express.Router();

router.post('/', selectHandlerByRole({
    employee: asyncWrapper(customerController.createCustomer)
}));

router.post('/:customerId/password', selectHandlerByRole({
    customer: asyncWrapper(customerController.createPasswordChangeForCustomer)
}));

export default router;
