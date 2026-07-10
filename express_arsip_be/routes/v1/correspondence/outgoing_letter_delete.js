import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import {
  Logging,
  validatePayload,
} from "../components/tools/servertool.js";

const router = express.Router();

const outgoingLetterDelete = async (req, res) => {
  const cFile = "outgoing_letter_delete.js";
  const cFunc = "outgoingLetterDelete";
  const oPayload = {
    ...(req.params || {}),
    ...(req.body || {}),
  };

  try {
    const oValidation = {
      id_surat_keluar: Joi.number().required(),
      updated_by: Joi.number().allow(null).optional(),
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
        status: false,
        message: cValidate,
      });
    }

    if (oPayload.updated_by) {
      const oUser = await DB("mst_pengguna")
        .where("id_pengguna", oPayload.updated_by)
        .first();

      if (!oUser) {
        return res.status(400).json({
          status: false,
          message: "User pengubah tidak ditemukan",
        });
      }
    }

    const oLetter = await DB("trs_surat_keluar")
      .where("id_surat_keluar", oPayload.id_surat_keluar)
      .whereNot("status", "dihapus")
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat keluar tidak ditemukan",
      });
    }

    const dNow = new Date();

    await DB.transaction(async (trx) => {
      await trx("trs_surat_keluar")
        .where("id_surat_keluar", oPayload.id_surat_keluar)
        .update({
          status: "dihapus",
          updated_by: oPayload.updated_by || null,
          updated_at: dNow,
        });

      await trx("trs_tracking_surat_keluar").insert({
        id_surat_keluar: oPayload.id_surat_keluar,
        status: "dihapus",
        aktivitas: "surat_dihapus",
        catatan: oPayload.catatan || "Surat keluar dihapus",
        tanggal: dNow,
        dibuat_oleh: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });
    });

    return res.status(200).json({
      status: true,
      message: "Surat keluar berhasil dihapus",
    });
  } catch (error) {
    const oResult = {
      status: false,
      message: "Surat keluar gagal dihapus",
    };

    await Logging(error, {
      file: cFile,
      func: cFunc,
      request: JSON.stringify(oPayload),
      response: oResult.message,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
};

router.delete("/:id_surat_keluar?", outgoingLetterDelete);

export default router;
