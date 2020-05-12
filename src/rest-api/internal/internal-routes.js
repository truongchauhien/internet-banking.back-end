import express from 'express';
import asyncWrapper from '../commons/middlewares/async-wrapper.js';
import verifyAccessToken from '../commons/middlewares/verify-access-token.js';
import authenticationRouter from './authentication/auth-routes.js';
import customerRouter from './customers/customer-routes.js';
import accountRouter from './accounts/account-routes.js';
import bankRouter from './banks/bank-routes.js';
import contactRouter from './contacts/contact-routes.js';
import transferRouter from './transfers/transfer-routes.js';
import debtRouter from './debts/debt-routes.js';
import transactionRouter from './transactions/transaction-routes.js';
import notificationRouter from './notifications/notification-routes.js';
import depositRouter from './deposits/deposit-routes.js';
import employeeRouter from './employees/employee-routes.js';
import reconciliationRouter from './reconciliations/reconciliation-routes.js';

const router = express.Router();
router.use('/auth', authenticationRouter);
router.use(asyncWrapper(verifyAccessToken)); // Below routes use access token.
router.use('/customers', customerRouter);
router.use('/accounts', accountRouter);
router.use('/banks', bankRouter);
router.use('/contacts', contactRouter);
router.use('/transfers', transferRouter);
router.use('/debts', debtRouter);
router.use('/transactions', transactionRouter);
router.use('/notifications', notificationRouter);
router.use('/deposits', depositRouter);
router.use('/employees', employeeRouter);
router.use('/reconciliations', reconciliationRouter);

export default router;
