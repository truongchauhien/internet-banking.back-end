import url from 'url';
import webSocketServer from './websocket-server.js';
import comsumeCustomerNotifications from './consumers/customer-notification-consumer.js';

export const integrate = (httpServer) => {
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
    await comsumeCustomerNotifications();
    isSetup = true;
};
