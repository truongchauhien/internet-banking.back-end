import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './configs/configs.js';
import logger from './modules/logger/logger.js';
import errorHandler from './middlewares/error-handling.js';
import internalRouter from './routes/internal-routes.js';
import publicRouter from './routes/public-routes.js';
import { integrate as integrateWebSocket, setup as setupWebSocket } from './websocket/integration.js';
import { setup as setupLinkedBankBankingApiModules } from './modules/linked-banks/banking-api-modules.js';
import { setup as setupRabbitMQ } from './modules/rabbitmq/rabbitmq.js';
import { setup as setupCustomerNotificationService } from './modules/realtime-notifications/customer-notifications.js';

const app = express();
app.use(express.json());
app.use(express.query());
if (config.get('env') === 'development') {
    app.use(morgan('dev'));
    app.use(cors());
}
app.use('/api', internalRouter);
app.use('/public/v1', publicRouter);
app.use(errorHandler);

const server = http.createServer();
const PORT = config.get('port');
(async () => {
    await setupRabbitMQ();
    await setupWebSocket();
    await setupCustomerNotificationService();
    await setupLinkedBankBankingApiModules();

    server.on('request', app);
    integrateWebSocket(server);
    server.listen(PORT, () => {
        logger.info(`App listening on port ${PORT}.`);
    });
})().catch(err => {
    logger.error(JSON.stringify(err));
    process.exit(1);
});
