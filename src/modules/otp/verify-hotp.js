import { generateHTOP } from './generate-htop.js';

export const verifyHOTP = (token, secret, counter) => {
    const hotp = generateHTOP(secret, counter);
    if (token === hotp) {
        return true;
    }

    return false;
}

export default verifyHOTP;
