import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import selectHandlerByRole from '../../commons/middlewares/select-handler-by-role.js';
import * as depositController from './deposit-controller.js';

const router = express.Router();

router.post('/', selectHandlerByRole({
    employee: asyncWrapper(depositController.createDeposit)
}));

export default router;
