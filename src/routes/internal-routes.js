import express from 'express';
import verifyAccessToken from '../middlewares/verify-access-token.js';
import authRouter from './internal-routes/auth-routes.js';
import accountRouterV1 from './internal-routes/account-routes.js';
import contactRouter from './internal-routes/contact-routes.js';
import queryRouter from './internal-routes/query-routes.js';
import transferRouter from './internal-routes/transfer-routes.js';
import debtRouter from './internal-routes/debt-routes.js';
import notificationRouter from './internal-routes/notification-routes.js';

const router = express.Router();
router.use('/auth', authRouter);
router.use(verifyAccessToken); // Below routes use access token.
router.use('/accounts', accountRouterV1);
router.use('/contacts', contactRouter);
router.use('/queries', queryRouter);
router.use('/transfers', transferRouter);
router.use('/debts', debtRouter);
router.use('/notifications', notificationRouter);

export default router;
