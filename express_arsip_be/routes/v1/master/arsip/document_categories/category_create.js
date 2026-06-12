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
        ArchiveClassificationId: Joi.number()
          .required()
          .label("ID Klasifikasi"),
        DocumentCategoryCode: Joi.string()
          .max(45)
          .required()
          .label("Kode Kategori"),
        DocumentCategoryName: Joi.string()
          .max(45)
          .required()
          .label("Nama Kategori"),

        Description: Joi.string()
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
        file: "category_create.js",
        func: "create",
        request: oPayload,
        response: oResult,
        user: username,
      });

      return res.status(422).json(oResult);
    }

    const dNow = new Date();
    await DB("mst_document_categories").insert({
      ArchiveClassificationId: oPayload.ArchiveClassificationId,
      DocumentCategoryCode: oPayload.DocumentCategoryCode,
      DocumentCategoryName: oPayload.DocumentCategoryName,
      Description: oPayload.Description || null,
      Status: "active",
      CreatedAt: dNow,
      UpdatedAt: dNow,
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
      func: "create",
      request: oPayload,
      response: oResult,
      user: username,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
