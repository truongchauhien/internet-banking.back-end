import http from 'http';
import configs from './modules/configs/configs.js';
import logger from './modules/logger/logger.js';
import restApi from './rest-api/index.js';
import { setup as setupRabbitMQ } from './modules/rabbitmq/rabbitmq.js';
import { setup as setupPushService } from './modules/push-service/index.js';
import { integrateWebSocketToHttpServer, setup as setupWebSocket } from './websocket/index.js';
import { setup as setupBankingApiModules } from './modules/banking-api-modules/banking-api-modules.js';

const httpServer = http.createServer();
const PORT = configs.get('port');
(async () => {
    await setupRabbitMQ();
    await setupPushService();
    await setupWebSocket();
    await setupBankingApiModules();

    httpServer.on('request', restApi);
    integrateWebSocketToHttpServer(httpServer);
    httpServer.listen(PORT, () => {
        logger.info(`App listening on port ${PORT}.`);
    });
})().catch(err => {
    logger.error(JSON.stringify(err));
    process.exit(1);
});
