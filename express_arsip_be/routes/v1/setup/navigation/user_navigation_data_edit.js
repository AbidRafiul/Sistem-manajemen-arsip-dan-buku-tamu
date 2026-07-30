import "dotenv/config";

import express from "express";
import { formatDateSystem, status } from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";

const router = express.Router();

const parseMenu = (rawMenu) => {
  if (!rawMenu) return [];
  if (Array.isArray(rawMenu)) return rawMenu;

  try {
    return JSON.parse(rawMenu);
  } catch {
    return [];
  }
};

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
        // 🚨 UBAH DI SINI: Dari NamaPengguna jadi id_pengguna
        id_pengguna: Joi.alternatives()
          .try(Joi.number(), Joi.string())
          .required()
          .label("id_pengguna"),
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
        file: "user_navigation_data_edit.js",
        func: "get",
        request: oPayload,
        response: oResult,
        user: req?.auth?.nama_pengguna || "",
      });

      return res.status(422).json(oResult);
    }

    let oNavigation = await DB("navigasi_pengguna")
      .select("menu")
      .where("id_pengguna", oPayload.id_pengguna)
      .first();

    // fallback ke mst_navigasi kalau tidak ada
    if (!oNavigation?.menu) {
      oNavigation = await DB("mst_navigasi")
        .select("menu")
        .where("peran", "master")
        .first();
    }

    if (!oNavigation?.menu) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "Data navigasi tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    const oUser = await DB("mst_pengguna_peran")
      .leftJoin("mst_peran", "mst_pengguna_peran.id_peran", "mst_peran.id_peran")
      .select(
        "mst_peran.nama_peran as peran",
        "mst_peran.kode_peran",
      )
      .where("mst_pengguna_peran.id_pengguna", oPayload.id_pengguna)
      .where("mst_pengguna_peran.status", "active")
      .orderBy("mst_pengguna_peran.peran_utama", "desc")
      .first();

    const oMst = await DB("mst_navigasi")
      .select("menu")
      .where((builder) => {
        builder
          .where("peran", oUser?.peran || "master")
          .orWhere("peran", oUser?.kode_peran || "master");
      })
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
      data: parseMenu(oMst.menu),
      menu: parseMenu(oNavigation.menu),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "user_navigation_data_edit.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
