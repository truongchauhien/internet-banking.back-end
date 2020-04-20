import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import config from '../configs/configs.js';
import rabbitmq from '../modules/rabbitmq/rabbitmq.js';

const TOKEN_SECRET_KEY = config.get('tokenSecretKey');

export const customers = {};

let channel = null;

const customerWebSocketServer = new WebSocket.Server({ noServer: true });
customerWebSocketServer.on('connection', (ws, request) => {
    ws.on('open', () => {

    });

    // Only launch at the first message from the client.
    ws.once('message', data => {
        const json = JSON.parse(data);
        const { accessToken } = json;
        jwt.verify(accessToken, TOKEN_SECRET_KEY, (err, decoded) => {
            if (err) {
                return ws.terminate();
            }

            const { userId: customerId } = decoded;
            if (!customers[customerId]) {
                customers[customerId] = { webSockets: [ws] };
            } else {
                customers[customerId].webSockets.push(ws);
            }
            ws.auth = { customerId };

            ws.on('message', data => {
                
            });
        });
    });

    ws.on('close', () => {
        if (!ws.auth) {
            return;
        }

        const { customerId } = ws.auth;
        if (customers[customerId].webSockets.length === 1) {
            delete customers[userId];
        } else {
            const removedIndex = customers[userId].webSockets.indexOf(ws);
            customers[userId].webSockets.splice(removedIndex, 1);
        }
    });
});

let isSetup = false;
export const setup = async () => {
    if (isSetup) return;

    const exchangeName = 'customer-notifications';

    const connection = rabbitmq.connection;
    channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, 'fanout', {
        durable: false
    });
    const assertQueue = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(assertQueue.queue, exchangeName, '');
    await channel.consume(assertQueue.queue, (message) => {
        const customer = customers[message.properties.headers.customerId];
        if (!customer) return;
        
        const json = message.content.toString();
        for (const ws of customer.webSockets) {
            ws.send(json);
        }
    }, {
        noAck: true
    });

    isSetup = true;
};

export default customerWebSocketServer;
