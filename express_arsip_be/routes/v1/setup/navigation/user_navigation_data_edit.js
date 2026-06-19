import "dotenv/config";

import express from "express";
import {
    datetime,
    formatDateSystem,
    hashEquals,
    hmac,
    status,
} from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { body } = req;
    const oPayload = body;

    try {
        if (!oPayload || Object.keys(oPayload).length < 1) {
            return res.status(400).json({
                status: status.BAD_REQUEST,
                message: "Invalid request body",
                datetime: formatDateSystem(),
            });
        }

        const cValidation = await validatePayload({
            // 🚨 UBAH DI SINI: Dari Username jadi UserId
            UserId: Joi.alternatives().try(Joi.number(), Joi.string()).required().label("UserId"),
        }, {
            "string.base": "{#label} harus berupa string",
            "string.empty": "{#label} tidak boleh kosong",
            "any.required": "{#label} wajib diisi",
        }, oPayload);


        if (cValidation) {
            const oResult = {
                status: status.BAD_REQUEST,
                message: cValidation || "Terdapat kesalahan pada data anda",
                datetime: formatDateSystem(),
            }

            Logging(null, {
                file: "user_navigation_data.js",
                func: "get",
                request: oPayload,
                response: oResult,
                user: req?.auth?.username || ""
            })

            return res.status(422).json(oResult);
        }

        let oNavigation = await DB('user_navigation')
            .select('menu')
            .where('user_id', oPayload.UserId)
            .first();

        // fallback ke mst_navigation kalau tidak ada
        if (!oNavigation?.menu) {
            oNavigation = await DB('mst_navigation')
                .select('menu')
                .where('role', 'master')
                .first();
        }

        if (!oNavigation?.menu) {
            return res.status(400).json({
                status: status.GAGAL,
                message: "Data navigasi tidak ditemukan",
                datetime: formatDateSystem(),
            });
        }

        const oUser = await DB('mst_user_roles') 
            .leftJoin('mst_roles', 'mst_user_roles.role_id', 'mst_roles.role_id')
            .select('mst_roles.role_name as role')
            .where('mst_user_roles.user_id', oPayload.UserId)
            .first();

        if (!oUser?.role || oUser?.role == 'superadmin') {
            oUser.role = 'master';
        }

        const oMst = await DB('mst_navigation')
            .select('menu')
            .where('role', oUser?.role)
            .first();

        if (!oMst?.menu) {
            return res.status(400).json({
                status: status.GAGAL,
                message: "Data navigasi tidak ditemukan",
                datetime: formatDateSystem(),
            });
        }

        return res.status(200).json({
            status: status.SUKSES,
            message: "Data ditemukan",
            datetime: formatDateSystem(),
            data: JSON.parse(oMst.menu),
            menu: JSON.parse(oNavigation.menu),
        });

    } catch (error) {
        const oResult = {
            status: status.BAD_REQUEST,
            message: "Sistem sedang maintenance harap tunggu sebentar",
            datetime: formatDateSystem(),
        }

        Logging(error, {
            file: "user_navigation_data.js",
            func: "get",
            request: oPayload,
            response: oResult,
            user: req?.auth?.username || ""
        })

        return res.status(500).json(oResult);
    }
});

export default router;