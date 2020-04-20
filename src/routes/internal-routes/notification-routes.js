import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import selectHandlerByRole from '../../middlewares/select-handler-by-role.js';
import * as notificationController from '../../controllers/internal-controllers/notification-controller.js';

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
