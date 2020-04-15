import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './configs/configs.js';
import logger from './modules/logger/logger.js';
import errorHandler from './middlewares/error-handling.js';
import authRouter from './routes/auth-routes.js';
import customerRouter from './routes/customer-routes.js';
import employeeRouter from './routes/employee-routes.js';
import administratorRouter from './routes/administrator-routes.js';
import { httpServerIntegrate } from './web-socket/web-socket.js';

const app = express();
app.use(express.json());
if (config.get('env') === 'development') {
    app.use(morgan('dev'));
    app.use(cors());
}
app.use('/auth', authRouter);
app.use('/customer-routes', customerRouter);
app.use('/employee-routes', employeeRouter);
app.use('/administrator-routes', administratorRouter);
app.use(errorHandler);

const server = http.createServer();
server.on('request', app);
httpServerIntegrate(server);

const PORT = config.get('port');
server.listen(PORT, () => {
    logger.info(`App listening on port ${PORT}.`);
}); 
