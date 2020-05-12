import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import selectHandlerByRole from '../../middlewares/select-handler-by-role.js';
import * as bankController from '../../controllers/internal-controllers/bank-controller.js';

const router = express.Router();
router.get('/', selectHandlerByRole({
    customer: bankController.getBanks,
    employee: bankController.getBanks,
    administrator: bankController.getBanks
}));

export default router;
