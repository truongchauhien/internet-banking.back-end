import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import {
    queryTransferableBankList,
    queryAccountInformation
} from '../../controllers/customer-controllers/query-controller.js';

const router = express.Router();

router.get('/banks', asyncWrapper(queryTransferableBankList));
router.post('/accounts', asyncWrapper(queryAccountInformation));

export default router;
