import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import * as authController from './auth-controller.js';

export const router = express.Router();

router.post('/login', asyncWrapper(authController.userLogin));
router.post('/token', asyncWrapper(authController.userRenewToken));
router.post('/password-reset', asyncWrapper(authController.createResetPasswordRequest));
router.post('/password-reset-confirmation', asyncWrapper(authController.confirmPasswordReset));

export default router;
