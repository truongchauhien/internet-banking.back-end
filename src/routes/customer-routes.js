import express from 'express';
import asyncWrapper from '../middlewares/async-wrapper.js';
import verifyAccessToken from '../middlewares/verify-access-token.js';
import accountRouter from './customer-routes/account-routes.js';
import contactRouter from './customer-routes/contact-routes.js';
import transferRouter from './customer-routes/transfer-routes.js';

const router = express.Router();
router.use(asyncWrapper(verifyAccessToken));
router.use('/accounts', accountRouter);
router.use('/contacts', contactRouter);
router.use('/transfer', transferRouter);

export default router;
