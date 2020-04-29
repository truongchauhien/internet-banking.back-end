import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import chooseHandlerByRole from '../../middlewares/select-handler-by-role.js';
import * as transferController from '../../controllers/internal-controllers/transfer-controller.js'

const router = express.Router();

router.post('/', chooseHandlerByRole({
    customer: asyncWrapper(transferController.createTransfer)
}));
router.get('/:transferId', chooseHandlerByRole({
    customer: asyncWrapper(transferController.getTransfer)
}));
router.post('/:transferId', chooseHandlerByRole({
    customer: asyncWrapper(transferController.confirmTransfer)
}));

export default router;
