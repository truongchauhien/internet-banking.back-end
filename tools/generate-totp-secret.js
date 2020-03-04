import { generateSecret } from '../src/modules/otp/generate-secret.js';

generateSecret().then(secret => {
    console.log(secret);
}).catch(err => {
    console.log(err);
});
