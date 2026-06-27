import "dotenv/config";

import express from "express";
import { formatDateSystem, status } from "../../components/tools/general.js";
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

    const cValidation = await validatePayload(
      {
        // UBAH DI SINI: Dari nama_pengguna jadi NamaPengguna
        NamaPengguna: Joi.alternatives()
          .try(Joi.number(), Joi.string())
          .required()
          .label("NamaPengguna"),
        Menu: Joi.string().required().label("Menu"),
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
        file: "user_navigation_insert.js",
        func: "insert",
        request: oPayload,
        response: oResult,
        user: req?.auth?.nama_pengguna || "",
      });

      return res.status(422).json(oResult);
    }

    await DB("user_navigation")
      .insert({
        id_pengguna: oPayload.NamaPengguna,
        menu: oPayload.Menu,
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      })
      .onConflict("id_pengguna")
      .merge({
        menu: oPayload.Menu,
        updated_at: formatDateSystem(),
      });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data disimpan",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "user_navigation_insert.js",
      func: "insert",
      request: oPayload,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
