
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

import { formatDateCalendar } from './dateTools';

export const getBasicToken = () => {
    const dateStr = formatDateCalendar(new Date(), 'yyyyMMdd');
    const userKey = `${process.env.USER_KEY}#${dateStr}#Key`;
    const userPasKey = `${process.env.USER_PAS_KEY}#${dateStr}#PassKey`;
    const userSecret = `${process.env.USER_SECRET}#${dateStr}#SecretKey`;

    const hmac1 = hmac(userKey, userSecret);
    const hmac2 = hmac(userPasKey, userSecret);
    const credentials = Buffer.from(`${hmac1}:${hmac2}`).toString('base64');
    return `Basic ${credentials}`;
};

