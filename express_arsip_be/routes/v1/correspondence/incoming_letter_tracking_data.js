import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";


const router = express.Router();

const incomingLetterTrackingData = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      IncomingLetterId: Joi.number().required(),
    };

    const oMessage = {
      "IncomingLetterId.required": "IncomingLetterId wajib diisi",
      "IncomingLetterId.number": "IncomingLetterId harus berupa angka",
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
      .select(
        "IncomingLetterId",
        "AgendaNumber",
        "LetterNumber",
        "Subject",
        "SenderName",
        "Status"
      )
      .where("IncomingLetterId", oPayload.IncomingLetterId)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    const vaData = await DB("trs_incoming_letter_trackings as tilt")
      .leftJoin(
        "trs_letter_dispositions as tld",
        "tilt.DispositionId",
        "tld.DispositionId"
      )
      .select(
        "tilt.IncomingLetterTrackingId",
        "tilt.IncomingLetterId",
        "tilt.DispositionId",
        "tilt.ActionName",
        "tilt.FromUserId",
        "tilt.ToUserId",
        "tilt.PreviousStatus",
        "tilt.CurrentStatus",
        "tilt.Notes",
        "tilt.ProcessedAt",
        "tilt.CreatedBy",
        "tilt.CreatedAt",
        "tilt.UpdatedAt",

        "tld.ParentDispositionId",
        "tld.Instruction",
        "tld.DispositionNote",
        "tld.DueDate",
        "tld.Status as DispositionStatus"
      )
      .where("tilt.IncomingLetterId", oPayload.IncomingLetterId)
      .orderBy("tilt.ProcessedAt", "asc");

    return res.status(200).json({
      status: true,
      message: "Tracking surat masuk berhasil diambil",
      data: {
        Letter: oLetter,
        Trackings: vaData,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Tracking surat masuk gagal diambil",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterTrackingData);

export default router;