import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import {
    createIntrabankTransfer,
    getIntrabankTransfer,
    confirmIntrabankTransfer,
} from '../../controllers/customer-controllers/transfer-controller.js'

const router = express.Router();

router.post('/intrabank', asyncWrapper(createIntrabankTransfer));
router.get('/intrabank/:transferId', asyncWrapper(getIntrabankTransfer));
router.patch('/intrabank/:transferId', asyncWrapper(confirmIntrabankTransfer));

export default router;
