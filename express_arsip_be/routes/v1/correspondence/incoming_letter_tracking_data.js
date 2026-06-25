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
      "surat_masuk_id.required": "id surat masuk  wajib diisi",
      "surat_masuk_id.number": " id surat masuk harus berupa angka",
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

    const oLetter = await DB("trs_surat_masuk")
      .select(
        "surat_masuk_id",
        "nomor_agenda",
        "nomor_surat",
        "perihal",
        "nama_pengirim",
        "status"
      )
      .where("surat_masuk_id", oPayload.incoming_letter_id)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    const vaData = await DB("trs_tracking_surat_masuk as tilt")
      .leftJoin(
        "trs_diposisi_surat as tld",
        "tilt.disposisi_id",
        "tld.disposisi_id"
      )
      .select(
        "tilt.tracking_surat_masuk_id",
        "tilt.surat_masuk_id",
        "tilt.disposisi_id",
        "tilt.nama_aksi",
        "tilt.dari_pengguna_id",
        "tilt.kepada_pengguna_id",
        "tilt.status_sebelumnya",
        "tilt.status_saat_ini",
        "tilt.catatan",
        "tilt.processed_at",
        "tilt.created_by",
        "tilt.created_at",
        "tilt.updated_at",

        "tld.diposisi_induk_id",
        "tld.instruksi",
        "tld.catatan_diposisi",
        "tld.batas_waktu",
        "tld.status as status_diposisi"
      )
      .where("tilt.surat_masuk_id", oPayload.incoming_letter_id)
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
