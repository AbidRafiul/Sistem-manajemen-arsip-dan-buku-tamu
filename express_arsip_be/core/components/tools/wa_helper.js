import axios from 'axios';
import { Logging } from '../../../routes/v1/components/tools/servertool.js';

// Ambil token dari file .env (Jika tidak ada, fallback ke string kosong untuk mencegah error)
const WA_API_TOKEN = process.env.WA_API_TOKEN || '';

/**
 * Mengirim pesan WhatsApp via Fonnte API secara Asynchronous (fire-and-forget).
 * @param {string} targetNumber - Nomor HP tujuan (contoh: '08123456789' atau '628123456789')
 * @param {string} message - Isi pesan WA
 * @param {string|null} imageUrl - URL Gambar (opsional, contoh: QR Code)
 * @returns {Promise<boolean>}
 */
export const sendWhatsAppMessage = async (targetNumber, message, imageUrl = null) => {
    const token = process.env.WA_API_TOKEN || process.env.FONNTE_TOKEN || '8WKN4xH92PuRFDHVddZk';

    // Jika token belum disetting, kita skip saja dan beri log
    if (!token) {
        console.log(`\n[WA Gateway - Simulated] Pesan untuk ${targetNumber}:\n${message}\nImage URL: ${imageUrl}\n`);
        return false;
    }

    if (!targetNumber) {
        return false;
    }

    try {
        const payload = {
            target: targetNumber,
            message: message,
            countryCode: '62', // Default Indonesia
        };

        if (imageUrl) {
            payload.url = imageUrl;
            payload.filename = 'qrcode.png';
        }

        const response = await axios.post('https://api.fonnte.com/send', payload, {
            headers: {
                'Authorization': token
            }
        });

        console.log(`[WA Gateway Success] Terkirim ke ${targetNumber}:`, response.data?.detail || response.data);
        return true;
    } catch (error) {
        console.error(`[WA Gateway Error] Gagal kirim ke ${targetNumber}:`, error.message);
        if (error.response) {
            console.error(`[WA Gateway Error Response]:`, JSON.stringify(error.response.data));
        }
        Logging(error, {
            file: 'wa_helper.js',
            func: 'sendWhatsAppMessage',
            targetNumber
        });
        return false;
    }
};
