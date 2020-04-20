import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import selectHandlerByRole from '../../middlewares/select-handler-by-role.js';
import * as accountController from '../../controllers/internal-controllers/account-controller.js';

const router = express.Router();

router.get('/', selectHandlerByRole({
    customer: asyncWrapper(accountController.getAccounts)
}));
router.get('/:identityValue', selectHandlerByRole({
    customer: asyncWrapper(accountController.getAccount)
}));

export default router;
