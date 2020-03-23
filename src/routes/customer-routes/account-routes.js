import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import * as accountController from '../../controllers/customer-controllers/account-controller.js';

const router = express.Router();
router.get('/', asyncWrapper(accountController.getAccounts));
router.get('/:accountNumber/transactions', asyncWrapper(accountController.getAccountTransactions));

export default router;
