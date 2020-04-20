import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import * as authController from '../../controllers/internal-controllers/auth-controller.js';

export const router = express.Router();

router.post('/login', asyncWrapper(authController.userLogin));
router.post('/token', asyncWrapper(authController.userRenewToken));

export default router;
