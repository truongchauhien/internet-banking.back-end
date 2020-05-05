import express from 'express';
import asyncWrapper from '../middlewares/async-wrapper.js';
import verifyAccessToken from '../middlewares/verify-access-token.js';
import authRouter from './internal-routes/auth-routes.js';
import customerRouter from './internal-routes/customer-routes.js';
import accountRouter from './internal-routes/account-routes.js';
import contactRouter from './internal-routes/contact-routes.js';
import queryRouter from './internal-routes/query-routes.js';
import transferRouter from './internal-routes/transfer-routes.js';
import debtRouter from './internal-routes/debt-routes.js';
import transactionRouter from './internal-routes/transaction-routes.js';
import notificationRouter from './internal-routes/notification-routes.js';
import depositRouter from './internal-routes/deposit-routes.js';
import employeeRouter from './internal-routes/employee-routes.js';

const router = express.Router();
router.use('/auth', authRouter);
router.use(asyncWrapper(verifyAccessToken)); // Below routes use access token.
router.use('/customers', customerRouter);
router.use('/accounts', accountRouter);
router.use('/contacts', contactRouter);
router.use('/queries', queryRouter);
router.use('/transfers', transferRouter);
router.use('/debts', debtRouter);
router.use('/transactions', transactionRouter);
router.use('/notifications', notificationRouter);
router.use('/deposits', depositRouter);
router.use('/employees', employeeRouter);

export default router;
