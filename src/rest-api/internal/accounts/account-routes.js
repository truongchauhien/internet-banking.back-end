import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import selectHandlerByRole from '../../commons/middlewares/select-handler-by-role.js';
import * as accountController from './account-controller.js';

const router = express.Router();

router.get('/', selectHandlerByRole({
    customer: asyncWrapper(accountController.getAccountsForCustomer),
    employee: asyncWrapper(accountController.getAccountsForEmployee)
}));
router.get('/:identity', selectHandlerByRole({
    customer: asyncWrapper(accountController.getAccountForCustomer)
}));
router.delete('/:identity', selectHandlerByRole({
    customer: asyncWrapper(accountController.closeAccount)
}));
router.post('/', selectHandlerByRole({
    employee: asyncWrapper(accountController.createAccount)
}));

export default router;
