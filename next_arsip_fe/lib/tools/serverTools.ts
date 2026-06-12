'use server'

import axios from "axios";
import { destroyCookie } from 'nookies';
import { signOut } from 'next-auth/react';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { findToValuesRecursive } from "./generalTools";
import { auth } from "./authTools";
import postData from "../axios/postData";


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


const routeMiddleware = async (searchUrl: string) => {
    const session = await auth();

    if (!session?.user) {
        return '99';
    }

<<<<<<< HEAD
    // 2. Validasi Waktu Kedaluwarsa Session (Token Lifecycle)
    const dSessionExp = new Date(session?.expires);
=======
    const dSessionExp = parse(session?.expires, 'yyyy-MM-dd HH:mm:ss', new Date());
>>>>>>> 0e9c28e76ae4aaaed219e1ffa7546d124ada1cdb
    const dNow = new Date();

    if (Number.isNaN(dSessionExp.getTime()) || dNow.getTime() > dSessionExp.getTime()) {
        return '99';
    }

    if (session.user.uniqueId) {
        try {
<<<<<<< HEAD
            let apiPath = process.env.NEXT_PUBLIC_API_DIR_PATH || '/api/v1';

=======

            let apiPath = process.env.NEXT_PUBLIC_API_DIR_PATH || '/api/v1';
            
>>>>>>> 0e9c28e76ae4aaaed219e1ffa7546d124ada1cdb
            if (!apiPath.startsWith('http')) {
                apiPath = `http://localhost:8000${apiPath}`;
            }

            const resp = await axios.post(
                `${apiPath}/setup/nav/user-data`,
                { UniqueId: session?.user?.uniqueId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const menu = resp.data.data;

            if (!menu) {
                console.warn("[RouteMiddleware] Backend merespon, tetapi data menu kosong.");
                return '00';
            }

            let urlFix = searchUrl;
            if (searchUrl.length > 1) {
                urlFix = searchUrl.replace(new RegExp(/\/$/), '');
            }

            const res = findToValuesRecursive(menu, urlFix);


            if (res.length < 1) {
                return '98';
            }
        } catch (error: any) {
<<<<<<< HEAD
            // Log pencatatan error di terminal server secara rapi (Berguna untuk dokumentasi projek)
            console.error("[RouteMiddleware Error]:", error?.message);

            if (error?.response?.status == '401') {
                return '99';
            }

            return '00';
=======

            console.error("🔴 [RouteMiddleware Error]:", error?.message);
            
            if (error?.response?.status == '401') {
                return '99';
            }
            
            return '00'; 
>>>>>>> 0e9c28e76ae4aaaed219e1ffa7546d124ada1cdb
        }
    } else {
        return '99';
    }

    return '00';
}


export const getDBConfig = async (key: string) => {
    let requestBody = {
        Key: key,
    };
    const getCfg = await postData("/function/db-config", requestBody);
    const data = getCfg.data.data;
    return data;
};

export { encryptChunkRSA, logout, routeMiddleware };
