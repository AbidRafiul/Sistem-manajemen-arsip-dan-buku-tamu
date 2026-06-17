import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";


const router = express.Router();

const incomingLetterTrackingData = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      incoming_letter_id: Joi.number().required(),
    };

    const oMessage = {
      "incoming_letter_id.required": "incoming_letter_id wajib diisi",
      "incoming_letter_id.number": "incoming_letter_id harus berupa angka",
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
        "incoming_letter_id",
        "agenda_number",
        "letter_number",
        "subject",
        "sender_name",
        "status"
      )
      .where("incoming_letter_id", oPayload.incoming_letter_id)
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
        "tilt.disposition_id",
        "tld.disposition_id"
      )
      .select(
        "tilt.incoming_letter_tracking_id",
        "tilt.incoming_letter_id",
        "tilt.disposition_id",
        "tilt.action_name",
        "tilt.from_user_id",
        "tilt.to_user_id",
        "tilt.previous_status",
        "tilt.current_status",
        "tilt.notes",
        "tilt.processed_at",
        "tilt.created_by",
        "tilt.created_at",
        "tilt.updated_at",

        "tld.parent_disposition_id",
        "tld.instruction",
        "tld.disposition_note",
        "tld.due_date",
        "tld.status as disposition_status"
      )
      .where("tilt.incoming_letter_id", oPayload.incoming_letter_id)
      .orderBy("tilt.processed_at", "asc");

    return res.status(200).json({
      status: true,
      message: "Tracking surat masuk berhasil diambil",
      data: {
        letter: oLetter,
        trackings: vaData,
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
