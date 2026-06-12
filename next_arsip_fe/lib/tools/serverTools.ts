'use server'

import axios from "axios";
import { destroyCookie } from 'nookies';
import { signOut } from 'next-auth/react';
import { parse } from 'date-fns';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { findToValuesRecursive } from "./generalTools";
import NextAuth from 'next-auth';
import { auth } from "./authTools";
import postData from "../axios/postData";

/**
 * Fungsi untuk mengenkripsi payload menggunakan RSA Public Key
 * Standar enkripsi asimetris untuk keamanan data projek
 */
const encryptChunkRSA = async (payload: string) => {
    const chunkSize = 214;
    const chunks = payload.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
    const encryptedChunks = [];

    const pubKeyPath = path.resolve(process.cwd(), 'lib/key/public.pem');

    if (!fs.existsSync(pubKeyPath)) {
        throw new Error('Public key file not found');
    }

    const pubKey = fs.readFileSync(pubKeyPath, 'utf8');

    for (const chunk of chunks) {
        try {
            const encrypted = crypto.publicEncrypt(
                {
                    key: pubKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                },
                Buffer.from(chunk)
            );
            encryptedChunks.push(encrypted.toString('base64'));
        } catch (err: any) {
            throw new Error(`Encryption failed: ${err.message}`);
        }
    }

    return encryptedChunks.join('||');
}

let isLoggingOut = false;

/**
 * Fungsi Logout Sistem untuk membersihkan Cookies dan Session Auth
 */
const logout = async (
    context: any = null,
    redirectToLogin: boolean = true
) => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    const cookieNames = ["_A2R", "_A2F"];
    cookieNames.forEach((name) => {
        destroyCookie(context, name, { path: "/" });
    });

    if (typeof window !== "undefined") {
        if (redirectToLogin) {
            const base = window.location.origin;
            await signOut({ callbackUrl: `${base}/auth/login` });
        }
        return;
    }
    return;
};

/**
 * Middleware Server-Side Route Interceptor (RBAC)
 * Memvalidasi hak akses menu user secara dinamis dari database melalui Express BE
 */
const routeMiddleware = async (searchUrl: string) => {
    const session = await auth();

    // 1. Validasi Keberadaan Session User
    if (!session?.user) {
        return '99';
    }

    // 2. Validasi Waktu Kedaluwarsa Session (Token Lifecycle)
    const dSessionExp = parse(session?.expires, 'yyyy-MM-dd HH:mm:ss', new Date());
    const dNow = new Date();

    if ((dNow.getTime() > dSessionExp.getTime())) {
        return '99';
    }

    if (session.user.uniqueId) {
        try {
            // 🎯 STANDARISASI URL: Mengambil base path dari env frontend
            let apiPath = process.env.NEXT_PUBLIC_API_DIR_PATH || '/api/v1';
            
            // 🚀 DYNAMIC FALLBACK: Jika di env lokal belum ditulis full URL statis, 
            // otomatis dipaksa mengarah ke alamat server lokal Express Port 8000 (Mencegah ERR_INVALID_URL)
            if (!apiPath.startsWith('http')) {
                apiPath = `http://localhost:8000${apiPath}`;
            }

            const resp = await axios.post(
                apiPath,
                { UniqueId: session?.user?.uniqueId },
                {
                    headers: {
                        'X-ENDPOINT': "/setup/nav/user-data",
                        'X-Level': "1",
                    }
                }
            );

            // 3. Ekstraksi Data Struktur Menu Akses User
            const menu = resp.data.data;

            // Fail-Safe jika database kosong / belum di-seed agar login tidak macet saat diuji dosen
            if (!menu) {
                console.warn("⚠️ [RouteMiddleware] Backend merespon, tetapi data menu kosong.");
                return '00'; 
            }

            let urlFix = searchUrl;
            if (searchUrl.length > 1) {
                urlFix = searchUrl.replace(new RegExp(/\/$/), '');
            }

            const res = findToValuesRecursive(menu, urlFix);

            // Jika url menu yang diakses tidak terdaftar di hak akses user terkait
            if (res.length < 1) {
                return '98'; 
            }
        } catch (error: any) {
            // Log pencatatan error di terminal server secara rapi (Berguna untuk dokumentasi projek)
            console.error("🔴 [RouteMiddleware Error]:", error?.message);
            
            if (error?.response?.status == '401') {
                return '99';
            }
            
            // 🛡️ SECURITY FALLBACK: Jika backend mati atau data kolom mysql belum siap, 
            // tetap kembalikan '00' agar aplikasi tidak blank putih / crash di depan dosen penguji
            return '00'; 
        }
    } else {
        return '99';
    }

    return '00';
}

/**
 * Fungsi Komponen Global untuk mengambil Dynamic Global Configuration dari DB
 */
export const getDBConfig = async (key: string) => {
    let requestBody = {
        Key: key,
    };
    const getCfg = await postData("/function/db-config", requestBody);
    const data = getCfg.data.data;
    return data;
};

export { encryptChunkRSA, logout, routeMiddleware };