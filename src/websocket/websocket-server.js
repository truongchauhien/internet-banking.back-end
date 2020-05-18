import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import configs from '../modules/configs/configs.js';
import logger from '../modules/logger/logger.js';
import { customers, employees, administrators } from './commons/websocket-users.js';

const TOKEN_SECRET_KEY = configs.get('tokenSecretKey');

const webSocketServer = new WebSocket.Server({ noServer: true });
webSocketServer.on('connection', (ws, request) => {
    // If a websocket connection does not verify its identity, the websocket connection will be terminated after 5 seconds.
    const timeoutId = setTimeout(() => {
        ws.terminate();
    }, 5 * 1000);

    // Only launch at the first message from the client.
    ws.once('message', data => {
        clearTimeout(timeoutId);

        const json = JSON.parse(data);
        const { accessToken } = json;
        jwt.verify(accessToken, TOKEN_SECRET_KEY, (err, decoded) => {
            if (err) {
                return ws.terminate();
            }

            const { userId, userType } = decoded;
            if (ws.readyState !== WebSocket.OPEN) {
                return;
            }

            handleUserConnection(userId, userType, ws);
        });
    });
});

function handleUserConnection(userId, userType, ws) {
    let users;
    let messageHandler;

    switch (userType) {
        case 'customer':
            users = customers;
            break;
        case 'employee':
            users = employees;
            break;
        case 'administrator':
            users = administrators;
            break;
        default:
            logger.warn('Unknown role! The websocket connection is terminated.');
            return ws.terminate();
    }

    if (!users[userId]) {
        users[userId] = { webSockets: [ws] };
    } else {
        users[userId].webSockets.push(ws);
    }

    ws.auth = {
        userId: userId,
        userType: userType
    };

    ws.on('message', data => {
        messageHandler && messageHandler(data);
    });

    ws.on('close', () => {
        if (users[userId].webSockets.length === 1) {
            delete users[userId];
        } else {
            const removedIndex = users[userId].webSockets.indexOf(ws);
            users[userId].webSockets.splice(removedIndex, 1);
        }
    });
}

export default webSocketServer;
