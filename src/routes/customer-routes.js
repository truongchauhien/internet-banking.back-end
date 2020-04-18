import express from 'express';
import asyncWrapper from '../middlewares/async-wrapper.js';
import verifyAccessToken from '../middlewares/verify-access-token.js';
import accountRouter from './customer-routes/account-routes.js';
import contactRouter from './customer-routes/contact-routes.js';
import queryRouter from './customer-routes/query-routes.js';
import transferRouter from './customer-routes/transfer-routes.js';
import debtRouter from './customer-routes/debt-routes.js';
import notificationRouter from './customer-routes/notification-routes.js';

const router = express.Router();

router.use(asyncWrapper(verifyAccessToken));
router.use('/accounts', accountRouter);
router.use('/contacts', contactRouter);
router.use('/query', queryRouter);
router.use('/transfer', transferRouter);
router.use('/debts', debtRouter);
router.use('/notifications', notificationRouter);

export default router;
