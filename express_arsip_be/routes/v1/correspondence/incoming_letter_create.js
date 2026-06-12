import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterCreate = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      AgendaNumber: Joi.string().max(100).required(),
      LetterNumber: Joi.string().max(100).required(),
      LetterDate: Joi.date().required(),
      ReceivedDate: Joi.date().required(),
      SenderName: Joi.string().max(150).required(),
      SenderInstitution: Joi.string().max(150).allow(null, "").optional(),
      Subject: Joi.string().max(255).required(),
      AttachmentDescription: Joi.string().allow(null, "").optional(),
      LetterTypeId: Joi.number().allow(null).optional(),
      DocumentTypeId: Joi.number().allow(null).optional(),
      ArchiveClassificationId: Joi.number().allow(null).optional(),
      ConfidentialityLevelId: Joi.number().allow(null).optional(),
      CreatedBy: Joi.number().allow(null).optional(),
      UpdatedBy: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "AgendaNumber.required": "Nomor agenda wajib diisi",
      "LetterNumber.required": "Nomor surat wajib diisi",
      "LetterDate.required": "Tanggal surat wajib diisi",
      "ReceivedDate.required": "Tanggal diterima wajib diisi",
      "SenderName.required": "Pengirim wajib diisi",
      "Subject.required": "Perihal wajib diisi",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      uniqueField: ["AgendaNumber"],
      table: "trs_incoming_letters",
      allowUnknown: false,
    });

    if (cValidate) {
      return res.status(400).json({
        status: false,
        message: cValidate,
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
        field: "CreatedBy",
        table: "mst_users",
        key: "UserId",
        label: "User pembuat",
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

    const nIncomingLetterId = await DB.transaction(async (trx) => {
      const vaInserted = await trx("trs_incoming_letters").insert({
        AgendaNumber: oPayload.AgendaNumber,
        LetterNumber: oPayload.LetterNumber,
        LetterDate: oPayload.LetterDate,
        ReceivedDate: oPayload.ReceivedDate,
        SenderName: oPayload.SenderName,
        SenderInstitution: oPayload.SenderInstitution || null,
        Subject: oPayload.Subject,
        AttachmentDescription: oPayload.AttachmentDescription || null,
        LetterTypeId: oPayload.LetterTypeId || null,
        DocumentTypeId: oPayload.DocumentTypeId || null,
        ArchiveClassificationId: oPayload.ArchiveClassificationId || null,
        ConfidentialityLevelId: oPayload.ConfidentialityLevelId || null,
        Status: "baru",
        CreatedBy: oPayload.CreatedBy || null,
        UpdatedBy: oPayload.UpdatedBy || null,
        CreatedAt: dNow,
        UpdatedAt: dNow,
      });

      const nId = vaInserted[0];

      await trx("trs_incoming_letter_trackings").insert({
        IncomingLetterId: nId,
        DispositionId: null,
        ActionName: "surat_dibuat",
        FromUserId: null,
        ToUserId: null,
        PreviousStatus: null,
        CurrentStatus: "baru",
        Notes: "Surat masuk dibuat",
        ProcessedAt: dNow,
        CreatedBy: oPayload.CreatedBy || null,
        CreatedAt: dNow,
        UpdatedAt: dNow,
      });

      return nId;
    });

    return res.status(201).json({
      status: true,
      message: "Surat masuk berhasil dibuat",
      data: {
        IncomingLetterId: nIncomingLetterId,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Surat masuk gagal dibuat",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterCreate);

export default router;
