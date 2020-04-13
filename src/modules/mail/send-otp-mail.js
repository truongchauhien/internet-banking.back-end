import mailer from './mailer.js';
import config from '../../configs/config-schema.js';

const OTP_SENDER = config.get('emailSenders.otp');

export const sendOtpMail = ({ toEmail, customerName, otp }) => {
    return mailer.sendMail({
        from: OTP_SENDER,
        to: toEmail,
        subject: 'Transfer Comfirmation-OTP',
        html: generateEmailContent({ customerName, otp })
    });
};

function generateEmailContent({ customerName, otp }) {
    return `<p>Dear <b>${customerName},</b></p>
<p>Here is verification code: <strong>${otp}</strong></p>
<p>It expires in 5 minutes.</p>`;
}
