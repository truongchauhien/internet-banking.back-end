import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import * as transferController from '../../controllers/customer-controllers/transfer-controller.js'

const router = express.Router();

router.post('/', transferController.createTransfer);
router.get('/:transferId', transferController.getTransfer);
router.post('/:transferId', transferController.confirmTransfer);

export default router;
