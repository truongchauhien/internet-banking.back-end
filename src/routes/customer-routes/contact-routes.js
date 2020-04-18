import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import * as contactController from '../../controllers/customer-controllers/contact-controller.js';

const router = express.Router();

router.get('/', asyncWrapper(contactController.getContacts));
router.post('/', asyncWrapper(contactController.createContact));
router.delete('/:contactId', asyncWrapper(contactController.deleteContact));
router.patch('/:contactId', asyncWrapper(contactController.patchContact));

export default router;
