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

router.put("/:DocumentCategoryId", async (req, res) => {
  const { body: oPayload } = req;
  const cDocumentCategoryId = req.params.DocumentCategoryId;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

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
        archive_classification_id: Joi.number()
          .required()
          .label("ID Klasifikasi Arsip"),
        document_category_code: Joi.string()
          .max(45)
          .required()
          .label("Kode Kategori"),
        document_category_name: Joi.string()
          .max(45)
          .required()
          .label("Nama Kategori"),
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
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: datetime(),
      };

      Logging(null, {
        file: "category_update.js",
        func: "update",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });

      return res.status(422).json(oResult);
    }

    const nUpdated = await DB("mst_document_categories")
      .where("document_category_id", cDocumentCategoryId)
      .update({
        archive_classification_id: oPayload.archive_classification_id,
        document_category_code: oPayload.document_category_code,
        document_category_name: oPayload.document_category_name,
        deskripsi: oPayload.deskripsi || null,
        updated_at: new Date(),
      });

    if (!nUpdated) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil diupdate",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    Logging(error, {
      file: "category_update.js",
      func: "update",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
