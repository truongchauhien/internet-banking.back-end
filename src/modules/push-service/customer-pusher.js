import rabbitmq from '../rabbitmq/rabbitmq.js';
import * as notificationModal from '../../models/notification-model.js';
import NOTIFICATION_STATUS, { REVERSE_NOTIFICATION_STATUS } from '../../models/constants/notification-status.js';
import NOTIFICATION_TYPES, { REVERSE_NOTIFICATION_TYPES } from '../../models/constants/notification-types.js';
import logger from '../logger/logger.js';

const EXCHANGE_NAME = 'messages-to-customers';

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

export const notify = ({ customerId, title, content, typeId = NOTIFICATION_TYPES.GENERIC, statusId = NOTIFICATION_STATUS.UNREAD }) => {
    notificationModal.createNotification({
        customerId, title, content, typeId, statusId
    }).then(createdNotification => {
        const message = JSON.stringify({
            type: 'notification',
            payload: {
                id: createdNotification.id,
                title,
                content,
                type: REVERSE_NOTIFICATION_TYPES[typeId] || REVERSE_NOTIFICATION_TYPES[NOTIFICATION_TYPES.GENERIC],
                status: REVERSE_NOTIFICATION_STATUS[statusId] || REVERSE_NOTIFICATION_STATUS[NOTIFICATION_STATUS.UNREAD]
            }
        });

        channel.publish(EXCHANGE_NAME, '', Buffer.from(message), {
            contentType: 'application/json',
            headers: {
                userId: customerId,
                userType: 'customer'
            }
        });
    }).catch(err => {
        logger.error(err.name + '\n' + err.message + '\n' + err.stack);
    });
};

export const notifyDebtCreated = (toCustomerId, senderName, message) => {
    notify({
        customerId: toCustomerId,
        title: 'Nhắc nợ mới',
        content: `Một nhắc nợ dành cho quý khác đã được tạo bởi "${senderName}" với lí do "${message}". Mời quý khách xem chi tiết trong phần nhắc nợ.`,
        typeId: NOTIFICATION_TYPES.DEBT_CREATED
    });
};

export const notifyDebtCanceledBySender = (toCustomerId, whoCanceled, message) => {
    notify({
        customerId: toCustomerId,
        title: 'Nhắc nợ bị hủy',
        content: `Một nhắc nợ dành cho quý khách vừa bị hủy bởi ${whoCanceled} với lí do "${message}".`,
        typeId: NOTIFICATION_TYPES.DEBT_CANCELED_BY_SENDER
    });
};

export const notifyDebtCanceledByReceiver = (toCustomerId, whoCanceled, message) => {
    notify({
        customerId: toCustomerId,
        title: 'Nhắc nợ bị hủy',
        content: `Một nhắc nợ của quý khách vừa bị hủy bởi ${whoCanceled} với lí do "${message}".`,
        typeId: NOTIFICATION_TYPES.DEBT_CANCELED_BY_RECEIVER
    });
};

export const notifyDebtPaid = (toCustomerId, whoPaid) => {
    notify({
        customerId: toCustomerId,
        title: 'Nhắc nợ được thanh toán',
        content: `${whoPaid} vừa thanh toán nhắc nợ của quý khách.`,
        typeId: NOTIFICATION_TYPES.DEBT_PAID
    });
};
