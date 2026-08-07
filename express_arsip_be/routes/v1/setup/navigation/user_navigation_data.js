import "dotenv/config";

import express from "express";
import { formatDateSystem, status } from "../../components/tools/general.js";
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
        nama_pengguna: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .optional()
          .label("nama_pengguna"),
        id_pengguna: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .optional()
          .label("id_pengguna"),

        user_id: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .optional()
          .label("user_id"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    const cUserLookup = String(
      oPayload.id_pengguna ||
      oPayload.user_id ||
      oPayload.nama_pengguna ||
      req?.auth?.id_pengguna ||
      req?.auth?.user_id ||
      req?.auth?.nama_pengguna ||
      "",
    ).trim();

    if (cValidation || !cUserLookup) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "nama_pengguna atau id_pengguna wajib diisi",
        datetime: formatDateSystem(),
      };

      Logging(null, {
        file: "user_navigation_data.js",
        func: "post",
        request: oPayload,
        response: oResult,
        user: req?.auth?.nama_pengguna || "",
      });

      return res.status(422).json(oResult);
    }

    const {
      menu: vaData,
      source,
      user,
    } = await getNavigationMenu(DB, cUserLookup);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: vaData,
      menu: vaData,
      source,
      user,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "user_navigation_data.js",
      func: "post",
      request: oPayload,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
