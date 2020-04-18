import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import * as notificationController from '../../controllers/customer-controllers/notification-controller.js';

const router = express.Router();

router.get('/', asyncWrapper(notificationController.getNotifications));
router.get('/:id', asyncWrapper(notificationController.getNotification));
router.patch('/:id', asyncWrapper(notificationController.updateNotification));
router.delete('/:id', asyncWrapper(notificationController.hideNotification));

export default router;
