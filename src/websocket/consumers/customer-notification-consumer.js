import rabbitmq from '../../modules/rabbitmq/rabbitmq.js';
import { customers } from '../websocket-users.js';

export async function consume() {
    const exchangeName = 'customer-notifications';

    const connection = rabbitmq.connection;
    const channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, 'fanout', {
        durable: false
    });
    const assertQueue = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(assertQueue.queue, exchangeName, '');
    await channel.consume(assertQueue.queue, (message) => {
        const customer = customers[message.properties.headers.customerId];
        if (!customer) return;

        const data = message.content.toString();
        for (const ws of customer.webSockets) {
            ws.send(data);
        }
    }, {
        noAck: true
    });
}

export default consume;
