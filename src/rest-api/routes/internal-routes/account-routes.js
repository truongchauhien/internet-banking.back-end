import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import selectHandlerByRole from '../../middlewares/select-handler-by-role.js';
import * as accountController from '../../controllers/internal-controllers/account-controller.js';

const router = express.Router();

router.get('/', selectHandlerByRole({
    customer: asyncWrapper(accountController.getAccountsForCustomer),
    employee: asyncWrapper(accountController.getAccountsForEmployee)
}));
router.get('/:identity', selectHandlerByRole({
    customer: asyncWrapper(accountController.getAccountForCustomer)
}));

export default router;
