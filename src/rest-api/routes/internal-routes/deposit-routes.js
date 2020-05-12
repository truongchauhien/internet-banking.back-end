import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import selectHandlerByRole from '../../middlewares/select-handler-by-role.js';
import * as depositController from '../../controllers/internal-controllers/deposit-controller.js';

const router = express.Router();

router.post('/', selectHandlerByRole({
    employee: asyncWrapper(depositController.createDeposit)
}));

export default router;
