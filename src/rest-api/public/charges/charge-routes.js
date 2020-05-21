import express from 'express';
import * as chargeController from './charge-controller.js';

const router = express.Router();
router.post('/', chargeController.createCharge);

export default router;
