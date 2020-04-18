import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import * as debtController from '../../controllers/customer-controllers/debt-controller.js';

const router = express.Router();

router.get('/', asyncWrapper(debtController.getDebts));
router.post('/', asyncWrapper(debtController.createDebt));
router.delete('/:debtId', asyncWrapper(debtController.cancelDebt));

export default router;
