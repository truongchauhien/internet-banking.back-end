import config from '../modules/configs/configs.js';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from './middlewares/error-handling.js';
import internalRouter from './routes/internal-routes.js';
import publicRouter from './routes/public-routes.js';

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

export default app;
