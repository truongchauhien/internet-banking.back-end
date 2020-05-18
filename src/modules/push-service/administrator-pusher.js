import rabbitmq from '../rabbitmq/rabbitmq.js';
import logger from '../logger/logger.js';

const EXCHANGE_NAME = 'messages-to-administrators';

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

export const pushUpdate = (entityName, updates) => {
    const message = JSON.stringify({
        type: 'update',
        payload: {
            entity: entityName,
            updates: updates
        }
    });

    channel.publish(EXCHANGE_NAME, '', Buffer.from(message), {
        contentType: 'application/json',
        headers: {
            userId: '*',
            userType: 'administrator'
        }
    });
};
