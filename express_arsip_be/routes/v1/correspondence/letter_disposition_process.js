import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const letterDispositionProcess = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      DispositionId: Joi.number().required(),
      ProcessNote: Joi.string().allow(null, "").optional(),
      UpdatedBy: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "DispositionId.required": "DispositionId wajib diisi",
      "DispositionId.number": "DispositionId harus berupa angka",
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

    const oDisposition = await DB("trs_letter_dispositions")
      .where("DispositionId", oPayload.DispositionId)
      .first();

    if (!oDisposition) {
      return res.status(404).json({
        status: false,
        message: "Disposisi surat tidak ditemukan",
      });
    }

    if (oDisposition.Status === "selesai") {
      return res.status(400).json({
        status: false,
        message: "Disposisi sudah selesai dan tidak dapat diproses ulang",
      });
    }

    if (oDisposition.Status === "diproses") {
      return res.status(400).json({
        status: false,
        message: "Disposisi sudah dalam proses",
      });
    }

    const oLetter = await DB("trs_incoming_letters")
      .where("IncomingLetterId", oDisposition.IncomingLetterId)
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
        message: "Surat masuk sudah selesai dan disposisi tidak dapat diproses",
      });
    }

    const dNow = new Date();

    await DB.transaction(async (trx) => {
      await trx("trs_letter_dispositions")
        .where("DispositionId", oPayload.DispositionId)
        .update({
          Status: "diproses",
          ReceivedAt: oDisposition.ReceivedAt || dNow,
          ProcessedAt: dNow,
          UpdatedBy: oPayload.UpdatedBy || null,
          UpdatedAt: dNow,
        });

      await trx("trs_incoming_letters")
        .where("IncomingLetterId", oDisposition.IncomingLetterId)
        .update({
          Status: "diproses",
          UpdatedBy: oPayload.UpdatedBy || null,
          UpdatedAt: dNow,
        });

      await trx("trs_incoming_letter_trackings").insert({
        IncomingLetterId: oDisposition.IncomingLetterId,
        DispositionId: oPayload.DispositionId,
        ActionName: "disposisi_diproses",
        FromUserId: oDisposition.FromUserId || null,
        ToUserId: oDisposition.ToUserId || null,
        PreviousStatus: oLetter.Status,
        CurrentStatus: "diproses",
        Notes: oPayload.ProcessNote || "Disposisi mulai diproses",
        ProcessedAt: dNow,
        CreatedBy: oPayload.UpdatedBy || null,
        CreatedAt: dNow,
        UpdatedAt: dNow,
      });
    });

    return res.status(200).json({
      status: true,
      message: "Disposisi surat berhasil diproses",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Disposisi surat gagal diproses",
      error: error.message,
    });
  }
};

router.post("/", letterDispositionProcess);

export default router;