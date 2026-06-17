import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterDelete = async (req, res) => {
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

    const oLetter = await DB("trx_incoming_letters")
      .where("incoming_letter_id", oPayload.incoming_letter_id)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    await DB.transaction(async (trx) => {
      await trx("trx_incoming_letters")
        .where("incoming_letter_id", oPayload.incoming_letter_id)
        .del();
    });

    return res.status(200).json({
      status: true,
      message: "Surat masuk berhasil dihapus",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Surat masuk gagal dihapus",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterDelete);

export default router;
