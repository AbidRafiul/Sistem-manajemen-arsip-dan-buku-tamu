import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { Logging, validatePayload } from "../components/tools/servertool.js";
import { status, datetime } from "../components/tools/general.js";

const router = express.Router();

const outgoingLetterReject = async (req, res) => {
  const cFile = "outgoing_letter_reject.js";
  const cFunc = "outgoingLetterReject";
  const oPayload = req.body || {};

  try {
    const oValidation = {
      id_surat_keluar: Joi.number().required(),
      catatan: Joi.string().allow(null, "").optional(),
    };

    const oMessage = {
      "id_surat_keluar.required": "id_surat_keluar wajib diisi",
      "id_surat_keluar.number": "id_surat_keluar harus berupa angka",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      allowUnknown: false,
    });

    if (cValidate) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: cValidate,
      });
    }

    const oLetter = await DB("trs_surat_keluar")
      .where("id_surat_keluar", oPayload.id_surat_keluar)
      .whereNot("status", "dihapus")
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: status.BAD_REQUEST,
        message: "Surat keluar tidak ditemukan",
      });
    }

    if (oLetter.status !== "menunggu_approval") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Surat keluar tidak sedang menunggu approval (status saat ini: " + oLetter.status + ")",
      });
    }

    const dNow = new Date();
    const nActorId = req?.auth?.id_pengguna || null;

    await DB.transaction(async (trx) => {
      // 1. Update status to 'ditolak'
      await trx("trs_surat_keluar")
        .where("id_surat_keluar", oPayload.id_surat_keluar)
        .update({
          status: "ditolak",
          updated_by: nActorId,
          updated_at: dNow,
        });

      // 2. Insert into tracking
      await trx("trs_tracking_surat_keluar").insert({
        id_surat_keluar: oPayload.id_surat_keluar,
        status: "ditolak",
        aktivitas: "surat_ditolak",
        catatan: oPayload.catatan || "Surat keluar ditolak",
        tanggal: dNow,
        dibuat_oleh: nActorId,
        created_at: dNow,
        updated_at: dNow,
      });
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Surat keluar berhasil ditolak",
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Surat keluar gagal ditolak",
    };

    await Logging(error, {
      file: cFile,
      func: cFunc,
      request: JSON.stringify(oPayload),
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
};

router.post("/", outgoingLetterReject);

export default router;
