import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const letterDispositionComplete = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      DispositionId: Joi.number().required(),
      CompleteNote: Joi.string().allow(null, "").optional(),
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
        message: "Disposisi sudah selesai",
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
        message: "Surat masuk sudah selesai",
      });
    }

    const dNow = new Date();

    let bAllDispositionCompleted = false;

    await DB.transaction(async (trx) => {
      await trx("trs_letter_dispositions")
        .where("DispositionId", oPayload.DispositionId)
        .update({
          Status: "selesai",
          ReceivedAt: oDisposition.ReceivedAt || dNow,
          ProcessedAt: oDisposition.ProcessedAt || dNow,
          CompletedAt: dNow,
          UpdatedBy: oPayload.UpdatedBy || null,
          UpdatedAt: dNow,
        });

      await trx("trs_incoming_letter_trackings").insert({
        IncomingLetterId: oDisposition.IncomingLetterId,
        DispositionId: oPayload.DispositionId,
        ActionName: "disposisi_selesai",
        FromUserId: oDisposition.FromUserId || null,
        ToUserId: oDisposition.ToUserId || null,
        PreviousStatus: oLetter.Status,
        CurrentStatus: "diproses",
        Notes: oPayload.CompleteNote || "Disposisi telah diselesaikan",
        ProcessedAt: dNow,
        CreatedBy: oPayload.UpdatedBy || null,
        CreatedAt: dNow,
        UpdatedAt: dNow,
      });

      const vaUnfinishedDispositions = await trx("trs_letter_dispositions")
        .where("IncomingLetterId", oDisposition.IncomingLetterId)
        .whereNot("Status", "selesai");

      if (vaUnfinishedDispositions.length === 0) {
        bAllDispositionCompleted = true;

        await trx("trs_incoming_letters")
          .where("IncomingLetterId", oDisposition.IncomingLetterId)
          .update({
            Status: "selesai",
            UpdatedBy: oPayload.UpdatedBy || null,
            UpdatedAt: dNow,
          });

        await trx("trs_incoming_letter_trackings").insert({
          IncomingLetterId: oDisposition.IncomingLetterId,
          DispositionId: oPayload.DispositionId,
          ActionName: "surat_selesai",
          FromUserId: oDisposition.FromUserId || null,
          ToUserId: oDisposition.ToUserId || null,
          PreviousStatus: oLetter.Status,
          CurrentStatus: "selesai",
          Notes: "Semua disposisi selesai, surat masuk dinyatakan selesai",
          ProcessedAt: dNow,
          CreatedBy: oPayload.UpdatedBy || null,
          CreatedAt: dNow,
          UpdatedAt: dNow,
        });
      } else {
        await trx("trs_incoming_letters")
          .where("IncomingLetterId", oDisposition.IncomingLetterId)
          .update({
            Status: "diproses",
            UpdatedBy: oPayload.UpdatedBy || null,
            UpdatedAt: dNow,
          });
      }
    });

    return res.status(200).json({
      status: true,
      message: bAllDispositionCompleted
        ? "Disposisi selesai dan surat masuk telah selesai"
        : "Disposisi surat berhasil diselesaikan",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Disposisi surat gagal diselesaikan",
      error: error.message,
    });
  }
};

router.post("/", letterDispositionComplete);

export default router;