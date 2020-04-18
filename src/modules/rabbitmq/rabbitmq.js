import amqp from 'amqplib';
import configs from '../../configs/configs.js';
import logger from '../logger/logger.js';

/**
 * @type
 * {{
 *      connection: amqp.Connection
 * }}
 */
export const rabbitmq = {
    connection: null
};

let isSetup = false;
export const setup = async () => {
    if (isSetup) return;

    const host = configs.get('rabbitMQ.host');
    const port = configs.get('rabbitMQ.port');
    const user = configs.get('rabbitMQ.user');
    const pass = configs.get('rabbitMQ.pass');
    const connection = await amqp.connect(`amqp://${host}:${port}`, {
        credentials: amqp.credentials.plain(user, pass)
    });

    rabbitmq.connection = connection;
    isSetup = true;

    logger.info('The connection to RabbitMQ broker is OK.');
};

export default rabbitmq;
