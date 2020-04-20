import url from 'url';
import customerWss, { setup as setupCustomerWss } from './customer-websocket-server.js';

export const integrate = (httpServer) => {
    httpServer.on('upgrade', (request, socket, head) => {
        const pathname = url.parse(request.url).pathname;

        if (pathname === '/websocket/customers') {
            customerWss.handleUpgrade(request, socket, head, ws => {
                customerWss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });
};

let isSetup = false;
export const setup = async () => {
    if (isSetup) return;
    await setupCustomerWss();
    isSetup = true;
};
