import express from 'express';
import * as authController from '../controllers/auth-controller.js';
import wrapper from '../middlewares/async-wrapper.js';

export const router = express.Router();

router.post('/login', wrapper(authController.userLogin));
router.post('/token', wrapper(authController.userRenewToken));

export default router;
