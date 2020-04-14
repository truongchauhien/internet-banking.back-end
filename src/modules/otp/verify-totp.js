import { generateTOTP } from "./generate-totp.js";

export const verifyTOTP = (token, secret, window = 0) => {
    for (let errorWindow = -window; errorWindow <= window; ++errorWindow) {
        const totp = generateTOTP(secret, 30_000, errorWindow);
        if (token === totp) {
            return true;
        }
    }
    return false;
};

export default verifyTOTP;
