import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import * as accountController from './account-controller.js';

const router = express.Router();
router.post('/', asyncWrapper(accountController.getAccount));

export default router;
