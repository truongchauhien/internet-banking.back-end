import http from 'http';
import config from './modules/configs/configs.js';
import logger from './modules/logger/logger.js';
import restApi from './rest-api/index.js';
import { integrate as integrateWebSocket, setup as setupWebSocket } from './websocket/integration.js';
import { setup as setupBankingApiModules } from './modules/banking-api-modules/banking-api-modules.js';
import { setup as setupRabbitMQ } from './modules/rabbitmq/rabbitmq.js';
import { setup as setupCustomerNotificationService } from './modules/realtime-notifications/customer-notifications.js';

const server = http.createServer();
const PORT = config.get('port');
(async () => {
    await setupRabbitMQ();
    await setupWebSocket();
    await setupCustomerNotificationService();
    await setupBankingApiModules();

    server.on('request', restApi);
    integrateWebSocket(server);
    server.listen(PORT, () => {
        logger.info(`App listening on port ${PORT}.`);
    });
})().catch(err => {
    logger.error(JSON.stringify(err));
    process.exit(1);
});
