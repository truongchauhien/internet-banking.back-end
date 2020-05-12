import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import chooseHandlerByRole from '../../middlewares/select-handler-by-role.js';
import * as transactionController from '../../controllers/internal-controllers/transaction-controller.js';

const router = express.Router();

router.get('/', chooseHandlerByRole({
    customer: asyncWrapper(transactionController.getOwnTransactions),
    employee: asyncWrapper(transactionController.getTransactions)
}));

export default router;
