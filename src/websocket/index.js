import url from 'url';
import webSocketServer from './websocket-server.js';
import {
    consumeCustomerNotifications,
    consumeAdministratorNotifications
} from './consumers/message-consumers.js';

export const integrateWebSocketToHttpServer = (httpServer) => {
    httpServer.on('upgrade', (request, socket, head) => {
        const pathname = url.parse(request.url).pathname;

        if (pathname === '/websocket') {
            webSocketServer.handleUpgrade(request, socket, head, ws => {
                webSocketServer.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });
};

let isSetup = false;
export const setup = async () => {
    if (isSetup) return;
    await consumeCustomerNotifications();
    await consumeAdministratorNotifications();
    isSetup = true;
};
