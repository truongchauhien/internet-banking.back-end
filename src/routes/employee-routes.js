import express from 'express';
import verifyAccessToken from '../middlewares/verify-access-token.js';
import asyncWrapper from '../middlewares/async-wrapper.js';
import customerRouter from './employee-routes/customer-routes.js';

const router = express.Router();
router.use(asyncWrapper(verifyAccessToken));
router.use('/customers', customerRouter);

export default router;
