import express from 'express';
import accountRouter from './public-routes/account-routes.js';
import chargeRouter from './public-routes/charge-routes.js';
import transferRouter from './public-routes/transfer-routes.js';

const router = express.Router();

router.use('/accounts', accountRouter);
router.use('/charges', chargeRouter);
router.use('/transfers', transferRouter);

export default router;
