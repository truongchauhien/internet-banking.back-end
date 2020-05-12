import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import selectHandlerByRole from '../../commons/middlewares/select-handler-by-role.js';
import * as debtController from './debt-controller.js';

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
