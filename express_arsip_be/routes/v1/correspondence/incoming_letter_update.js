import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterUpdate = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      IncomingLetterId: Joi.number().required(),

      AgendaNumber: Joi.string().max(100).optional(),
      LetterNumber: Joi.string().max(100).optional(),
      LetterDate: Joi.date().optional(),
      ReceivedDate: Joi.date().optional(),
      SenderName: Joi.string().max(150).optional(),
      SenderInstitution: Joi.string().max(150).allow(null, "").optional(),
      Subject: Joi.string().max(255).optional(),
      AttachmentDescription: Joi.string().allow(null, "").optional(),

      LetterTypeId: Joi.number().allow(null).optional(),
      DocumentTypeId: Joi.number().allow(null).optional(),
      ArchiveClassificationId: Joi.number().allow(null).optional(),
      ConfidentialityLevelId: Joi.number().allow(null).optional(),

      Status: Joi.string()
        .valid("baru", "diproses", "didisposisi", "selesai")
        .optional(),

      UpdatedBy: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "IncomingLetterId.required": "IncomingLetterId wajib diisi",
      "IncomingLetterId.number": "IncomingLetterId harus berupa angka",

      "AgendaNumber.max": "Nomor agenda maksimal 100 karakter",
      "LetterNumber.max": "Nomor surat maksimal 100 karakter",
      "SenderName.max": "Nama pengirim maksimal 150 karakter",
      "Subject.max": "Perihal maksimal 255 karakter",

      "Status.valid":
        "Status hanya boleh baru, diproses, didisposisi, atau selesai",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      uniqueField: ["AgendaNumber"],
      table: "trs_incoming_letters",
      excludedField: "IncomingLetterId",
      allowUnknown: false,
    });

    if (cValidate) {
      return res.status(400).json({
        status: false,
        message: cValidate,
      });
    }

    const oLetter = await DB("trs_incoming_letters")
      .where("IncomingLetterId", oPayload.IncomingLetterId)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    const vaReferenceChecks = [
      {
        field: "LetterTypeId",
        table: "mst_letter_types",
        key: "LetterTypeId",
        label: "Jenis surat",
      },
      {
        field: "DocumentTypeId",
        table: "mst_document_type",
        key: "DocumentTypeId",
        label: "Tipe dokumen",
      },
      {
        field: "ArchiveClassificationId",
        table: "mst_archive_classifications",
        key: "ArchiveClassificationId",
        label: "Klasifikasi arsip",
      },
      {
        field: "ConfidentialityLevelId",
        table: "mst_confidentiality_levels",
        key: "ConfidentialityLevelId",
        label: "Level kerahasiaan",
      },
      {
        field: "UpdatedBy",
        table: "mst_users",
        key: "UserId",
        label: "User pengubah",
      },
    ];

    for (const oReference of vaReferenceChecks) {
      const value = oPayload[oReference.field];

      if (value === undefined || value === null || value === "") {
        continue;
      }

      const oData = await DB(oReference.table)
        .where(oReference.key, value)
        .first();

      if (!oData) {
        return res.status(400).json({
          status: false,
          message: `${oReference.label} tidak ditemukan`,
        });
      }
    }

    const dNow = new Date();

    const oUpdate = {
      AgendaNumber: oPayload.AgendaNumber,
      LetterNumber: oPayload.LetterNumber,
      LetterDate: oPayload.LetterDate,
      ReceivedDate: oPayload.ReceivedDate,
      SenderName: oPayload.SenderName,
      SenderInstitution: oPayload.SenderInstitution,
      Subject: oPayload.Subject,
      AttachmentDescription: oPayload.AttachmentDescription,
      LetterTypeId: oPayload.LetterTypeId,
      DocumentTypeId: oPayload.DocumentTypeId,
      ArchiveClassificationId: oPayload.ArchiveClassificationId,
      ConfidentialityLevelId: oPayload.ConfidentialityLevelId,
      Status: oPayload.Status,
      UpdatedBy: oPayload.UpdatedBy || null,
      UpdatedAt: dNow,
    };

    Object.keys(oUpdate).forEach((cKey) => {
      if (oUpdate[cKey] === undefined) {
        delete oUpdate[cKey];
      }
    });

    await DB.transaction(async (trx) => {
      await trx("trs_incoming_letters")
        .where("IncomingLetterId", oPayload.IncomingLetterId)
        .update(oUpdate);

      await trx("trs_incoming_letter_trackings").insert({
        IncomingLetterId: oPayload.IncomingLetterId,
        DispositionId: null,
        ActionName: "surat_diupdate",
        FromUserId: null,
        ToUserId: null,
        PreviousStatus: oLetter.Status,
        CurrentStatus: oUpdate.Status || oLetter.Status,
        Notes: "Data surat masuk diperbarui",
        ProcessedAt: dNow,
        CreatedBy: oPayload.UpdatedBy || null,
        CreatedAt: dNow,
        UpdatedAt: dNow,
      });
    });

    return res.status(200).json({
      status: true,
      message: "Surat masuk berhasil diupdate",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Surat masuk gagal diupdate",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterUpdate);

export default router;
