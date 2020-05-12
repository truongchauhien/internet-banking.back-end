import express from 'express';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import selectHandlerByRole from '../../commons/middlewares/select-handler-by-role.js';
import * as notificationController from './notification-controller.js';

const router = express.Router();

router.get('/', selectHandlerByRole({
    customer: asyncWrapper(notificationController.getNotifications)
}));
router.get('/:id', selectHandlerByRole({
    customer: asyncWrapper(notificationController.getNotification)
}));
router.patch('/:id', selectHandlerByRole({
    customer: asyncWrapper(notificationController.updateNotification)
}));
router.delete('/:id', selectHandlerByRole({
    customer: asyncWrapper(notificationController.hideNotification)
}));

export default router;
