import mailer from './mailer.js';
import config from '../../configs/configs.js';
import logger from '../logger/logger.js';

const OTP_SENDER = config.get('emailSenders.otp');

const sendOtpMail = ({ toEmail, subject, html }) => {
    mailer.sendMail({
        from: OTP_SENDER,
        to: toEmail,
        subject: subject,
        html: html
    }).catch(err => {
        logger.error(err.name + '\n' + err.message + '\n' + err.stack);
    });
};

export const sendOtpMailForTransferCofirmation = ({ toEmail, customerName, otp }) => {
    sendOtpMail({
        toEmail,
        subject: 'Transfer Comfirmation',
        html: `<p>Dear <b>${customerName},</b></p>
<p>Here is verification code: <strong>${otp}</strong></p>
<p>It expires in 5 minutes.</p>`
    });
};

export const sendOtpMailForPasswordResetConfirmationMail = ({ toEmail, customerName, otp }) => {
    sendOtpMail({
        toEmail,
        subject: 'Password Reset Confirmation',
        html: `<p>Dear <b>${customerName},</b></p>
        <p>Here is verification code: <strong>${otp}</strong></p>
        <p>It expires in 5 minutes.</p>`
    });
};
