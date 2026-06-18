import express from "express";
import Joi from "joi";
import DB from "../../../../../core/config/knex.js";
import { datetime, formatDateSystem, status } from "../../../components/tools/general.js";
import { Logging, validatePayload } from "../../../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
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
        document_category_id: Joi.number().required().label("ID Kategori Dokumen"),
        retention_code: Joi.string().max(45).required().label("Kode Retensi"),
        retention_name: Joi.string().max(45).required().label("Nama Retensi"),
        retention_years: Joi.number().required().label("Tahun Retensi"),
        retention_action: Joi.string().max(45).required().label("Tindakan Retensi"),
        description: Joi.string().max(45).optional().allow(null, "").label("Deskripsi"),
      },
      {
        "string.empty": "{#label} tidak boleh kosong",
        "string.max": "{#label} maksimal {#limit} karakter",
        "any.required": "{#label} wajib diisi",
        "number.base": "{#label} harus berupa angka",
      },
      oPayload
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: datetime(),
      };

      Logging(null, {
        file: "retention_create.js",
        func: "create",
        request: oPayload,
        response: oResult,
        user: username,
      });

      return res.status(422).json(oResult);
    }

    const dNow = new Date();
    await DB("mst_retention_schedule").insert({
      document_category_id: oPayload.document_category_id,
      retention_code: oPayload.retention_code,
      retention_name: oPayload.retention_name,
      retention_years: oPayload.retention_years,
      retention_action: oPayload.retention_action,
      description: oPayload.description || null,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "Data jadwal retensi berhasil dibuat",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    Logging(error, {
      file: "retention_create.js",
      func: "create",
      request: oPayload,
      response: oResult,
      user: username,
    });

    return res.status(500).json(oResult);
  }
});

export default router;