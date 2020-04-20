import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './configs/configs.js';
import logger from './modules/logger/logger.js';
import errorHandler from './middlewares/error-handling.js';
import internalRouter from './routes/internal-routes.js';
import { integrate as integrateWebSocket, setup as setupWebSocket } from './web-socket/web-socket.js';
import { setup as setupThirdPartyBankingApi } from './modules/third-party-banking-api/third-party-banking-api.js';
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
app.use(errorHandler);

const server = http.createServer();
const PORT = config.get('port');
(async () => {
    await setupThirdPartyBankingApi();
    await setupRabbitMQ();
    await setupWebSocket();
    await setupCustomerNotificationService();

    server.on('request', app);
    integrateWebSocket(server);
    server.listen(PORT, () => {
        logger.info(`App listening on port ${PORT}.`);
    });
})().catch(err => {
    logger.error(JSON.stringify(err));
    process.exit(1);
});
