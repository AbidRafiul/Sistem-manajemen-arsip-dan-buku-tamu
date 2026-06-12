import express from "express";
import Joi from "joi";
import DB from "../../../../../core/config/knex.js";
import { datetime, formatDateSystem, status } from "../../../components/tools/general.js";
import { Logging, validatePayload } from "../../../components/tools/servertool.js";

const router = express.Router();

router.put("/:RetentionScheduleId", async (req, res) => {
  const { body: oPayload } = req;
  const cRetentionScheduleId = req.params.RetentionScheduleId;
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
        DocumentCategoryId: Joi.number().required().label("ID Kategori Dokumen"),
        RetentionCode: Joi.string().max(45).required().label("Kode Retensi"),
        RetentionName: Joi.string().max(45).required().label("Nama Retensi"),
        RetentionYears: Joi.number().required().label("Tahun Retensi"),
        RetentionAction: Joi.string().max(45).required().label("Tindakan Retensi"),
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
        file: "retention_update.js",
        func: "update",
        request: oPayload,
        response: oResult,
        user: username,
      });

      return res.status(422).json(oResult);
    }

    const nUpdated = await DB("mst_retention_schedule")
      .where("RetentionScheduleId", cRetentionScheduleId)
      .update({
        DocumentCategoryId: oPayload.DocumentCategoryId,
        RetentionCode: oPayload.RetentionCode,
        RetentionName: oPayload.RetentionName,
        RetentionYears: oPayload.RetentionYears,
        RetentionAction: oPayload.RetentionAction,
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
      file: "retention_update.js",
      func: "update",
      request: oPayload,
      response: oResult,
      user: username,
    });

    return res.status(500).json(oResult);
  }
});

export default router;