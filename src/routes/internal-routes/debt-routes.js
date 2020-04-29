import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import * as debtController from '../../controllers/internal-controllers/debt-controller.js';
import selectHandlerByRole from '../../middlewares/select-handler-by-role.js';

const router = express.Router();

router.get('/', selectHandlerByRole({
    customer: asyncWrapper(debtController.getDebts)
}));
router.get('/:identityValue', selectHandlerByRole({
    customer: asyncWrapper(debtController.getDebt)
}));
router.post('/', selectHandlerByRole({
    customer: asyncWrapper(debtController.createDebt)
}));
router.delete('/:debtId', selectHandlerByRole({
    customer: asyncWrapper(debtController.cancelDebt)
}));

export default router;
