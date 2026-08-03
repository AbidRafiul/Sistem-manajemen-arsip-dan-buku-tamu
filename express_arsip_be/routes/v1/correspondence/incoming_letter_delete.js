import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload, Logging } from "../components/tools/servertool.js";
const router = express.Router();
const incomingLetterDelete = async (req, res) => {
  try {
    const oPayload = req.body || {};
    if (!oPayload.surat_masuk_id && oPayload.incoming_letter_id) {
      oPayload.surat_masuk_id = oPayload.incoming_letter_id;
      delete oPayload.incoming_letter_id;
    }
    const oValidation = {
      surat_masuk_id: Joi.number().required()
    };
    const oMessage = {
      "surat_masuk_id.required": "id surat masuk wajib diisi",
      "surat_masuk_id.number": "id surat masuk harus berupa angka"
    };
    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      allowUnknown: false
    });
    if (cValidate) {
      return res.status(400).json({
        status: false,
        message: cValidate
      });
    }
    const oLetter = await DB("trs_surat_masuk").where("surat_masuk_id", oPayload.surat_masuk_id).first();
    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan"
      });
    }
    const dNow = new Date();
    await DB.transaction(async trx => {
      await trx("trs_surat_masuk").where("surat_masuk_id", oPayload.surat_masuk_id).update({
        status: "dihapus",
        updated_at: dNow
      });
      await trx("trs_tracking_surat_masuk").insert({
        surat_masuk_id: oPayload.surat_masuk_id,
        status: "dihapus",
        aktivitas: "surat_dihapus",
        catatan: "Surat masuk dihapus",
        tanggal: dNow,
        created_at: dNow,
        updated_at: dNow
      });
    });
    return res.status(200).json({
      status: true,
      message: "Surat masuk berhasil dihapus"
    });
  } catch (error) {
    console.log(error);
    const oResult = {
      status: false,
      message: "Surat masuk gagal dihapus",
      error: error.message
    };
    Logging(error, {
      file: "incoming_letter_delete.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
};
router.post("/", incomingLetterDelete);
export default router;