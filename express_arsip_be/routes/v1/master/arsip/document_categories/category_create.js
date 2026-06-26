import express from "express";
import Joi from "joi";
import DB from "../../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../../components/tools/general.js";
import {
  Logging,
  validatePayload,
} from "../../../components/tools/servertool.js";

const router = express.Router();

const createDocumentCategory = async (req, res) => {
  const { body: oPayload } = req;
  const username = req?.auth?.username || "";

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
        kode_klasifikasi: Joi.string()
          .max(255)
          .required()
          .label("Kode Klasifikasi"),
        kode_kategori_dokumen: Joi.string()
          .max(255)
          .required()
          .label("Kode Kategori"),
        nama_kategori_dokumen: Joi.string()
          .max(255)
          .required()
          .label("Nama Kategori"),
        deskripsi: Joi.string()
          .max(255)
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
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: datetime(),
      };

      Logging(null, {
        file: "category_create.js",
        func: "createDocumentCategory",
        request: oPayload,
        response: oResult,
        user: username,
      });

      return res.status(422).json(oResult);
    }

    const dNow = new Date();
    await DB("mst_kategori_dokumen").insert({
      kode_klasifikasi: oPayload.kode_klasifikasi,
      kode_kategori_dokumen: oPayload.kode_kategori_dokumen,
      nama_kategori_dokumen: oPayload.nama_kategori_dokumen,
      deskripsi: oPayload.deskripsi || null,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "Data berhasil dibuat",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    Logging(error, {
      file: "category_create.js",
      func: "createDocumentCategory",
      request: oPayload,
      response: oResult,
      user: username,
    });

    return res.status(500).json(oResult);
  }
};

router.post("/", createDocumentCategory);

export default router;
