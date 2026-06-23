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
import { getNavigationMenu } from "./navigation_helper.js";

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

    const cValidation = await validatePayload(
      {
        UserId: Joi.alternatives()
          .try(Joi.number(), Joi.string())
          .required()
          .label("UserId"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: formatDateSystem(),
      };

      Logging(null, {
        file: "user_navigation_data.js",
        func: "post", // UBAH: disesuaikan dengan router.post
        request: oPayload,
        response: oResult,
        user: req?.auth?.username || "",
      });

      return res.status(422).json(oResult);
    }

    // 1. Ambil Menu Kustom User (Kustomisasi) dari user_navigation
    const oNavigation = await DB("user_navigation")
      .select("menu")
      .where("user_id", oPayload.UserId)
      .first();
      
    let vaData = oNavigation ? oNavigation.menu : [];
    if (typeof vaData === 'string') {
        try { vaData = JSON.parse(vaData); } catch(e) {}
    }

    // 2. Ambil Peta Induk (Master Navigation) buat nampilin pilihan checkbox di UI
    const oMasterNav = await DB("mst_navigation").select("menu").first();
    let masterMenu = oMasterNav ? oMasterNav.menu : [];
    if (typeof masterMenu === 'string') {
        try { masterMenu = JSON.parse(masterMenu); } catch(e) {}
    }

    // (Validasi block array dihapus agar user baru yang belum punya menu tidak kena error 400)

    // 3. Kirim respon LENGKAP ke Frontend
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: masterMenu, // Peta Induk (Semua opsi menu) -> Dibaca res.data di Frontend
      menu: vaData,     // Kustomisasi User -> Dibaca res.menu di Frontend
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "user_navigation_data.js",
      func: "post", // UBAH: disesuaikan dengan router.post
      request: oPayload,
      response: oResult,
      user: req?.auth?.username || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;