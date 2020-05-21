import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import * as transferController from './transfer-controller.js';

const router = express.Router();
router.post('/', asyncWrapper(transferController.createTransfer));

export default router;
