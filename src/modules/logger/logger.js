import winston from 'winston';
import configs from '../configs/configs.js';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            level: 'info',
            silent: configs.get('env') === 'testing' || configs.get('env') === 'production',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'combined.log',
            silent: configs.get('env') === 'testing' || configs.get('env') === 'development'
        })
    ]
});

export default logger;
