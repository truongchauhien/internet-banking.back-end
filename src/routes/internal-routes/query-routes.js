import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import selectHandlerByRole from '../../middlewares/select-handler-by-role.js';
import {
    getLinkedBanks,
    getAccountInformation
} from '../../controllers/internal-controllers/query-controller.js';

const router = express.Router();

router.get('/linked-banks', selectHandlerByRole({
    customer:
        asyncWrapper(getLinkedBanks)
}));
router.post('/accounts', selectHandlerByRole({
    customer:
        asyncWrapper(getAccountInformation)
}));

export default router;
