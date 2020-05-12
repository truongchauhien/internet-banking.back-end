import express from 'express';
import accountRouter from './accounts/account-routes.js';
import chargeRouter from './charges/charge-routes.js';
import transferRouter from './transfers/transfer-routes.js';

const router = express.Router();

router.use('/accounts', accountRouter);
router.use('/charges', chargeRouter);
router.use('/transfers', transferRouter);

export default router;
