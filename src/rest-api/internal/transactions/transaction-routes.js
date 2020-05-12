import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import chooseHandlerByRole from '../../commons/middlewares/select-handler-by-role.js';
import * as transactionController from './transaction-controller.js';

const router = express.Router();

router.get('/', chooseHandlerByRole({
    customer: asyncWrapper(transactionController.getOwnTransactions),
    employee: asyncWrapper(transactionController.getTransactions)
}));

export default router;
