import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import config from '../configs/configs.js';
import logger from '../modules/logger/logger.js';
import { customers, employees, administrators } from './websocket-users.js';

const TOKEN_SECRET_KEY = config.get('tokenSecretKey');

const webSocketServer = new WebSocket.Server({ noServer: true });
webSocketServer.on('connection', (ws, request) => {
    // Only launch at the first message from the client.
    ws.once('message', data => {
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
            
            switch (userType) {
                case 'customer':
                    const customerId = userId;

                    if (!customers[customerId]) {
                        customers[customerId] = { webSockets: [ws] };
                    } else {
                        customers[customerId].webSockets.push(ws);
                    }

                    ws.auth = {
                        customerId,
                        userType
                    };

                    ws.on('message', data => {
                        // Add handlers here.
                    });
                    break;
                case 'employee':
                    logger.warn('WebSocket connection for employee is not supported yet.');
                    return ws.terminate();
                case 'administrator':
                    logger.warn('WebSocket connection for administrator is not supported yet.');
                    return ws.terminate();
                default:
                    logger.warn('There is an unknown role in access token.');
                    return ws.terminate();
            }
        });
    });

    ws.on('close', () => {
        if (!ws.auth) {
            return;
        }

        const { userType } = ws.auth;
        switch (userType) {
            case 'customer':
                const customerId = ws.auth.customerId;

                if (customers[customerId].webSockets.length === 1) {
                    delete customers[customerId];
                } else {
                    const removedIndex = customers[customerId].webSockets.indexOf(ws);
                    customers[customerId].webSockets.splice(removedIndex, 1);
                }
                break;
            case 'employee':
            case 'adminstrator':
            default:
        }
    });
});

export default webSocketServer;
