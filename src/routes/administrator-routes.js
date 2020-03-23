import express from 'express';
import verifyAccessToken from '../middlewares/verify-access-token.js';
import asyncWrapper from '../middlewares/async-wrapper.js';

const router = express.Router();
router.use(asyncWrapper(verifyAccessToken));

export default router;
