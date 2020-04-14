import generateTOTP from "../src/modules/otp/generate-totp.js";
import verifyTOTP from "../src/modules/otp/verify-totp.js";

const SECRET = 'NG4ISNVES53UMRU7';
const token = generateTOTP(SECRET);
console.log(token);

const result = verifyTOTP(token, SECRET, 10);
console.log(result);
