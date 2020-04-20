import rabbitmq from '../rabbitmq/rabbitmq.js';
import { createNotification } from '../../models/notification-model.js';
import NOTIFICATION_STATUS from '../../models/constants/notification-status.js';
import NOTIFICATION_TYPES from '../../models/constants/notification-types.js';
import logger from '../logger/logger.js';

const EXCHANGE_NAME = 'customer-notifications';

/**
 * @type {import('amqplib').Channel}
 */
let channel = null;
let isSetup = false;
export const setup = async () => {
    if (isSetup) return;

    channel = await rabbitmq.connection.createChannel();
    channel.assertExchange(EXCHANGE_NAME, 'fanout', {
        durable: false
    });

    isSetup = true;
};

export const notify = ({ customerId, title, message, typeId, statusId = NOTIFICATION_STATUS.UNREAD }) => {
    const payload = JSON.stringify({
        customerId,
        type,
        title,
        message
    });

    channel.publish(EXCHANGE_NAME, '', Buffer.from(payload), {
        contentType: 'application/json',
        headers: {
            customerId: customerId
        }
    });

    createNotification({
        customerId, title, message, statusId, typeId
    }).catch(err => {
        logger.error(err.name + '\n' + err.message + '\n' + err.stack);
    });
};

export const notifyDebtCreated = (toCustomerId, senderName, message) => {
    notify({
        customerId: toCustomerId,
        title: 'Nhắc nợ mới',
        message: `Một nhắc nợ dành cho quý khác đã được tạo bởi ${senderName}. Mời quý khách xem chi tiết trong phần nhắc nợ.`,
        typeId: NOTIFICATION_TYPES.DEBT_CREATED
    });
};

export const notifyDebtCanceledBySender = (toCustomerId, whoCanceled, message) => {
    notify({
        customerId: toCustomerId,
        title: 'Nhắc nợ bị hủy',
        message: `Một nhắc nợ dành cho quý khách vừa bị hủy bởi ${whoCanceled} với lí do "${message}".`,
        typeId: NOTIFICATION_TYPES.DEBT_CANCELED_BY_SENDER
    });
};

export const notifyDebtCanceledByReceiver = (toCustomerId, whoCanceled, message) => {
    notify({
        customerId: toCustomerId,
        title: 'Nhắc nợ bị hủy',
        message: `Một nhắc nợ của quý khách vừa bị hủy bởi ${whoCanceled} với lí do "${message}".`,
        typeId: NOTIFICATION_TYPES.DEBT_CANCELED_BY_RECEIVER
    });
};

export const notifyDebtPaid = (toCustomerId, whoPaid, message) => {
    notify({
        customerId: toCustomerId,
        title: 'Nhắc nợ được thanh toán',
        message: `Một nhắc nợ của quý khách vừa được thanh toán bởi ${whoPaid} với lí do "${message}".`,
        typeId: NOTIFICATION_TYPES.DEBT_PAID
    });
};
