
const crypto = require('crypto');

export const hash = (text: string, alg = 'sha256') => {
    return crypto.createHash(alg).update(text).digest('hex');
};

export const hmac = (text: string, secret: string, alg = 'sha256') => {
    return crypto.createHmac(alg, secret).update(text).digest('hex');
};

export const hashEquals = (hashedInput: string, storedHash: string) => {
    const bufferInput = Buffer.from(hashedInput, 'hex');
    const bufferStored = Buffer.from(storedHash, 'hex');

    if (bufferInput.length !== bufferStored.length) return false;

    return crypto.timingSafeEqual(bufferInput, bufferStored);
};
