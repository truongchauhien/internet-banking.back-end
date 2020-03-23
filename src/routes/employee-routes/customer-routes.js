import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import { createCustomer } from '../../controllers/employee-controllers/customer-controller.js';

const router = express.Router();
router.post('/', asyncWrapper(createCustomer));

export default router;
