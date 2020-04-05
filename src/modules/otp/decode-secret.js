import base32Decode from 'base32-decode';

export const decodeSecret = (secret) => {
    return base32Decode(secret, 'RFC4648');
};

export default decodeSecret;
