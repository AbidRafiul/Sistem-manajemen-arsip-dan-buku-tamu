import express from "express";
import Joi from "joi";
import DB from "../../../../../core/config/knex.js";
import { datetime, formatDateSystem, status } from "../../../components/tools/general.js";
import { Logging, validatePayload } from "../../../components/tools/servertool.js";

const router = express.Router();

router.put("/:DocumentCategoryId", async (req, res) => {
  const { body: oPayload } = req;
  const cDocumentCategoryId = req.params.DocumentCategoryId;
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
        ArchiveClassificationId: Joi.number().required().label("ID Klasifikasi Arsip"),
        DocumentCategoryCode: Joi.string().max(45).required().label("Kode Kategori"),
        DocumentCategoryName: Joi.string().max(45).required().label("Nama Kategori"),
        Description: Joi.string().max(45).optional().allow(null, "").label("Deskripsi"),
      },
      {
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
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
        file: "category_update.js",
        func: "update",
        request: oPayload,
        response: oResult,
        user: username,
      });

      return res.status(422).json(oResult);
    }

    const nUpdated = await DB("mst_document_categories")
      .where("DocumentCategoryId", cDocumentCategoryId)
      .update({
        ArchiveClassificationId: oPayload.ArchiveClassificationId,
        DocumentCategoryCode: oPayload.DocumentCategoryCode,
        DocumentCategoryName: oPayload.DocumentCategoryName,
        Description: oPayload.Description || null,
        UpdatedAt: new Date(),
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
      user: username,
    });

    return res.status(500).json(oResult);
  }
});

export default router;