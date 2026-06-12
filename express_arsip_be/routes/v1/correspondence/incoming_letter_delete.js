import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterDelete = async (req, res) => {
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
      .where("IncomingLetterId", oPayload.IncomingLetterId)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    await DB.transaction(async (trx) => {
      await trx("trs_incoming_letters")
        .where("IncomingLetterId", oPayload.IncomingLetterId)
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
