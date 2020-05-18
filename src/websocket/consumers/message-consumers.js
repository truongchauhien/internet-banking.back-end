import rabbitmq from '../../modules/rabbitmq/rabbitmq.js';
import { customers, administrators } from '../commons/websocket-users.js';

async function consume(exchangeName, users) {
    const connection = rabbitmq.connection;
    const channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, 'fanout', {
        durable: false
    });
    const assertQueue = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(assertQueue.queue, exchangeName, '');
    await channel.consume(assertQueue.queue, (message) => {
        const userId = message.properties.headers.userId;
        if (userId === '*') {
            const data = message.content.toString();            
            for (const user of Object.values(users)) {
                for (const ws of user.webSockets) {
                    ws.send(data);
                }
            }
        } else {
            const user = users[userId];
            if (!user) return;

            const data = message.content.toString();
            for (const ws of user.webSockets) {
                ws.send(data);
            }
        }
    }, {
        noAck: true
    });
}

export const consumeCustomerNotifications = () => consume('messages-to-customers', customers);
export const consumeAdministratorNotifications = () => consume('messages-to-administrators', administrators);
