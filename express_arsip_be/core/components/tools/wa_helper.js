import axios from 'axios';
import { Logging } from '../../../routes/v1/components/tools/servertool.js';

// Ambil token dari file .env (Jika tidak ada, fallback ke string kosong untuk mencegah error)
const WA_API_TOKEN = process.env.WA_API_TOKEN || '';

/**
 * Mengirim pesan WhatsApp via Fonnte API secara Asynchronous (fire-and-forget).
 * @param {string} targetNumber - Nomor HP tujuan (contoh: '08123456789' atau '628123456789')
 * @param {string} message - Isi pesan WA
 * @returns {Promise<boolean>}
 */
export const sendWhatsAppMessage = async (targetNumber, message) => {
    // Jika token belum disetting, kita skip saja dan beri log (agar aplikasi tidak error saat development)
    if (!WA_API_TOKEN) {
        console.log(`\n[WA Gateway - Simulated] Pesan untuk ${targetNumber}:\n${message}\n(Silakan set WA_API_TOKEN di .env untuk mengirim secara nyata)\n`);
        return false;
    }

    if (!targetNumber) {
        return false;
    }

    try {
        const response = await axios.post('https://api.fonnte.com/send', {
            target: targetNumber,
            message: message,
            countryCode: '62', // Default Indonesia
        }, {
            headers: {
                'Authorization': WA_API_TOKEN 
            }
        });

        // Uncomment untuk debug response Fonnte
        // console.log(`[WA Gateway] Terkirim ke ${targetNumber}:`, response.data);
        return true;
    } catch (error) {
        console.error(`[WA Gateway Error] Gagal kirim ke ${targetNumber}:`, error.message);
        Logging(error, {
            file: 'wa_helper.js',
            func: 'sendWhatsAppMessage',
            targetNumber
        });
        return false;
    }
};
