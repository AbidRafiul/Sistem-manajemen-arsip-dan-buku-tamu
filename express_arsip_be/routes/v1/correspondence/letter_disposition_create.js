import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const letterDispositionCreate = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      IncomingLetterId: Joi.number().required(),
      ParentDispositionId: Joi.number().allow(null).optional(),

      FromUserId: Joi.number().allow(null).optional(),
      ToUserId: Joi.number().required(),

      DispositionInstructionId: Joi.number().allow(null).optional(),

      Instruction: Joi.string().allow(null, "").optional(),
      DispositionNote: Joi.string().allow(null, "").optional(),
      DueDate: Joi.date().allow(null).optional(),

      CreatedBy: Joi.number().allow(null).optional(),
      UpdatedBy: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "IncomingLetterId.required": "IncomingLetterId wajib diisi",
      "IncomingLetterId.number": "IncomingLetterId harus berupa angka",

      "ToUserId.required": "User tujuan disposisi wajib diisi",
      "ToUserId.number": "ToUserId harus berupa angka",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
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

    if (oLetter.Status === "selesai") {
      return res.status(400).json({
        status: false,
        message: "Surat masuk sudah selesai dan tidak dapat didisposisikan",
      });
    }

    const vaReferenceChecks = [
      {
        field: "FromUserId",
        table: "mst_users",
        key: "UserId",
        label: "User asal disposisi",
      },
      {
        field: "ToUserId",
        table: "mst_users",
        key: "UserId",
        label: "User tujuan disposisi",
      },
      {
        field: "DispositionInstructionId",
        table: "mst_disposition_instructions",
        key: "DispositionInstructionId",
        label: "Instruksi disposisi",
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

    if (oPayload.ParentDispositionId) {
      const oParentDisposition = await DB("trs_letter_dispositions")
        .where("DispositionId", oPayload.ParentDispositionId)
        .where("IncomingLetterId", oPayload.IncomingLetterId)
        .first();

      if (!oParentDisposition) {
        return res.status(404).json({
          status: false,
          message: "Parent disposisi tidak ditemukan pada surat ini",
        });
      }
    }

    const dNow = new Date();

    const nDispositionId = await DB.transaction(async (trx) => {
      const vaInserted = await trx("trs_letter_dispositions").insert({
        IncomingLetterId: oPayload.IncomingLetterId,
        ParentDispositionId: oPayload.ParentDispositionId || null,

        FromUserId: oPayload.FromUserId || null,
        ToUserId: oPayload.ToUserId,

        DispositionInstructionId: oPayload.DispositionInstructionId || null,

        Instruction: oPayload.Instruction || null,
        DispositionNote: oPayload.DispositionNote || null,
        DueDate: oPayload.DueDate || null,

        Status: "baru",
        ReceivedAt: null,
        ProcessedAt: null,
        CompletedAt: null,

        CreatedBy: oPayload.CreatedBy || null,
        UpdatedBy: oPayload.UpdatedBy || null,
        CreatedAt: dNow,
        UpdatedAt: dNow,
      });

      const nId = vaInserted[0];

      await trx("trs_incoming_letters")
        .where("IncomingLetterId", oPayload.IncomingLetterId)
        .update({
          Status: "didisposisi",
          UpdatedBy: oPayload.UpdatedBy || oPayload.CreatedBy || null,
          UpdatedAt: dNow,
        });

      await trx("trs_incoming_letter_trackings").insert({
        IncomingLetterId: oPayload.IncomingLetterId,
        DispositionId: nId,
        ActionName: "surat_didisposisi",
        FromUserId: oPayload.FromUserId || null,
        ToUserId: oPayload.ToUserId,
        PreviousStatus: oLetter.Status,
        CurrentStatus: "didisposisi",
        Notes: oPayload.DispositionNote || oPayload.Instruction || "Surat didisposisikan",
        ProcessedAt: dNow,
        CreatedBy: oPayload.CreatedBy || null,
        CreatedAt: dNow,
        UpdatedAt: dNow,
      });

      return nId;
    });

    return res.status(201).json({
      status: true,
      message: "Disposisi surat berhasil dibuat",
      data: {
        DispositionId: nDispositionId,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Disposisi surat gagal dibuat",
      error: error.message,
    });
  }
};

router.post("/", letterDispositionCreate);

export default router;
