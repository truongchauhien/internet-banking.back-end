import generateHTOP from './generate-htop.js';

export const generateTOTP = (secret, timestep = 30000, window = 0) => {
    const counter = Math.floor(Date.now() / timestep);
    return generateHTOP(secret, counter + window);
};

export default generateTOTP;
