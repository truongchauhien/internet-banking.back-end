import { createHmac } from 'crypto';
import { decodeSecret } from './generate-secret.js';

export const generateHTOP = (secret, counter) => {
    const decodedSecret = decodeSecret(secret);

    const counterBuffer = Buffer.alloc(8);
    for (let i = 0; i <= 7; ++i) {
        counterBuffer[7 - i] = counter & 0xff;
        counter = counter >> 8;
    }

    const hmac = createHmac('sha1', Buffer.from(decodedSecret));
    const hmacValue = hmac.update(counterBuffer).digest();

    const offset = hmacValue[hmacValue.length - 1] & 0xf;
    const code =
        ((hmacValue[offset] & 0x7f) << 24) |
        ((hmacValue[offset + 1] & 0xff) << 16) |
        ((hmacValue[offset + 2] & 0xff) << 8) |
        (hmacValue[offset + 3] & 0xff);

    const hotp = code % (10 ** 6);

    return hotp;
};

export const generateTOTP = (secret, timestep = 30000, window = 0) => {
    const counter = Math.floor(Date.now() / timestep);
    return generateHTOP(secret, counter + window);
};
