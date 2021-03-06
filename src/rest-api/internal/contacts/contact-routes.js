import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import selectHandlerByRole from '../../commons/middlewares/select-handler-by-role.js';
import * as contactController from './contact-controller.js';

const router = express.Router();

router.get('/', selectHandlerByRole({
    customer: asyncWrapper(contactController.getContacts)
}));
router.post('/', selectHandlerByRole({
    customer: asyncWrapper(contactController.createContact)
}));
router.delete('/:contactId', selectHandlerByRole({
    customer: asyncWrapper(contactController.deleteContact)
}));
router.patch('/:contactId', selectHandlerByRole({
    customer: asyncWrapper(contactController.patchContact)
}));

export default router;
