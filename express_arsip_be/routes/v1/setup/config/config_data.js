import express from "express";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import { formatDateSystem, status } from "../../components/tools/general.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const oPayload = req.body;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const cValidation = await validatePayload(
      {
        Kode: Joi.array()
          .items(Joi.string().required())
          .required()
          .label("Kode"),
      },
      {
        "array.base": "{#label} harus berupa array",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    if (cValidation) {
      const oResult = {
        status: status.GAGAL,
        message: cValidation,
        datetime: formatDateSystem(),
      };
      Logging(null, {
        file: "info_perusahaan_data.js",
        func: "data",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });
      return res.status(422).json(oResult);
    }
    const vaData = await DB("config")
      .whereIn("kode", oPayload.Kode)
      .select("kode", "keterangan");

    if (!vaData || vaData.length < 1) {
      const oResult = {
        status: status.GAGAL,
        message: "DATA TIDAK DITEMUKAN",
        datetime: formatDateSystem(),
        data: [],
      };
      Logging(null, {
        file: "config_data.js",
        func: "data",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });

      return res.status(400).json(oResult);
    }

    const oFormatted = {};
    vaData.forEach((row) => {
      oFormatted[row.kode] = row.keterangan;

      if (row.kode == "msLogoPerusahaan") {
        oFormatted["msLogoPerusahaan"] =
          `${process.env.APP_SERVER}:${process.env.APP_PORT}/uploads/config/logo_perusahaan/${row.keterangan}`;
      }
    });

    const oResult = {
      status: status.SUKSES,
      message: "Berhasil Mendapatkan Data",
      datetime: formatDateSystem(),
      data: oFormatted,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    console.log(error);
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };
    Logging(error, {
      file: "info_perusahaan_data.js",
      func: "data",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
