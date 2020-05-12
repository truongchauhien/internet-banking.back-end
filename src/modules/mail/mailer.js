import nodemailer from 'nodemailer';
import config from '../configs/configs.js';
import logger from '../logger/logger.js';

export const transporter = nodemailer.createTransport({
    host: config.get('smtp.host'),
    port: config.get('smtp.port'),
    secure: config.get('smtp.secure'),
    auth: {
        user: config.get('smtp.auth.user'),
        pass: config.get('smtp.auth.pass')
    }
});

transporter.verify((err, success) => {
    if (err) {
        logger.error(err);
    } else {
        logger.info('SMTP server is ready to take our messages.');
    }
});

export default transporter;
