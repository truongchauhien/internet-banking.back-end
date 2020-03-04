import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './configs/config-schema.js';
import authRouter from './routes/auth.js';
import errorHandler from './middlewares/error-handling.js';

const app = express();

app.use(express.json());
if (config.get('env') == 'development') {
    app.use(morgan('dev'));
    app.use(cors());
}

app.use('/auth', authRouter);

app.use(errorHandler);

const port = config.get('port');
app.listen(port, () => {
    console.log(`App listening on port ${port}.`);
});
