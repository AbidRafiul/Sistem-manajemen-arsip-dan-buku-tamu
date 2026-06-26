import express from "express";
import Joi from "joi";
import DB from "../../../../../core/config/knex.js";
import {
  status,
  formatDateSystem,
  datetime,
} from "../../../components/tools/general.js";
import {
  Logging,
  validatePayload,
} from "../../../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

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
        id_departemen: Joi.number().required().label("ID Departemen"),
        kode_unit_kerja: Joi.string()
          .max(45)
          .required()
          .label("Kode Unit Kerja"),
        work_unit_name: Joi.string()
          .max(45)
          .required()
          .label("Nama Unit Kerja"),
        deskripsi: Joi.string()
          .max(45)
          .optional()
          .allow(null, "")
          .label("Deskripsi"),
      },
      {
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation,
        datetime: datetime(),
      };
      Logging(null, {
        file: "work_unit_create.js",
        func: "create",
        request: oPayload,
        response: oResult,
        user: cnama_pengguna,
      });
      return res.status(422).json(oResult);
    }

    const dNow = new Date();
    await DB("mst_unit_kerja").insert({
      id_departemen: oPayload.id_departemen,
      kode_unit_kerja: oPayload.kode_unit_kerja,
      work_unit_name: oPayload.work_unit_name,
      deskripsi: oPayload.deskripsi || null,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "Berhasil ditambahkan!",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Gagal menyimpan",
      datetime: datetime(),
    };
    Logging(error, {
      file: "work_unit_create.js",
      func: "create",
      request: oPayload,
      response: oResult,
      user: cnama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
