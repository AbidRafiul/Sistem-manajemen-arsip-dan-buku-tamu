import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import {
  Logging,
  validatePayload,
} from "../components/tools/servertool.js";

const router = express.Router();

const checkReference = async ({ table, key, value, label }) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const oData = await DB(table).where(key, value).first();
  return oData ? null : `${label} tidak ditemukan`;
};

const outgoingLetterUpdate = async (req, res) => {
  const cFile = "outgoing_letter_update.js";
  const cFunc = "outgoingLetterUpdate";
  const oPayload = {
    ...(req.params || {}),
    ...(req.body || {}),
  };

  try {
    const oValidation = {
      id_surat_keluar: Joi.number().required(),
      nomor_surat: Joi.string().max(100).optional(),
      nomor_agenda: Joi.string().max(100).optional(),
      tanggal_surat: Joi.date().optional(),
      tanggal_kirim: Joi.date().allow(null).optional(),
      id_jenis_surat: Joi.number().optional(),
      perihal: Joi.string().max(255).optional(),
      tujuan: Joi.string().max(150).optional(),
      instansi_tujuan: Joi.string().max(150).allow(null, "").optional(),
      media_pengiriman: Joi.string().max(100).allow(null, "").optional(),
      status: Joi.string()
        .valid(
          "draft",
          "menunggu_approval",
          "disetujui",
          "ditolak",
          "terkirim",
          "selesai"
        )
        .optional(),
      updated_by: Joi.number().allow(null).optional(),
      catatan: Joi.string().allow(null, "").optional(),
    };

    const oMessage = {
      "id_surat_keluar.required": "id_surat_keluar wajib diisi",
      "id_surat_keluar.number": "id_surat_keluar harus berupa angka",
      "any.only": "Status surat keluar tidak valid",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      uniqueField: ["nomor_agenda"],
      table: "trs_surat_keluar",
      excludedField: "id_surat_keluar",
      allowUnknown: false,
    });

    if (cValidate) {
      return res.status(400).json({
        status: false,
        message: cValidate,
      });
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

    const vaReferenceChecks = [
      {
        table: "mst_jenis_surat",
        key: "jenis_surat_id",
        value: oPayload.id_jenis_surat,
        label: "Jenis surat",
      },
      {
        table: "mst_pengguna",
        key: "id_pengguna",
        value: oPayload.updated_by,
        label: "User pengubah",
      },
    ];

    for (const oReference of vaReferenceChecks) {
      const cReferenceError = await checkReference(oReference);

      if (cReferenceError) {
        return res.status(400).json({
          status: false,
          message: cReferenceError,
        });
      }
    }

    const dNow = new Date();
    const oUpdate = {
      nomor_surat: oPayload.nomor_surat,
      nomor_agenda: oPayload.nomor_agenda,
      tanggal_surat: oPayload.tanggal_surat,
      tanggal_kirim: oPayload.tanggal_kirim,
      id_jenis_surat: oPayload.id_jenis_surat,
      perihal: oPayload.perihal,
      tujuan: oPayload.tujuan,
      instansi_tujuan: oPayload.instansi_tujuan,
      media_pengiriman: oPayload.media_pengiriman,
      status: oPayload.status,
      updated_by: oPayload.updated_by || null,
      updated_at: dNow,
    };

    Object.keys(oUpdate).forEach((cKey) => {
      if (oUpdate[cKey] === undefined || cKey === "catatan") {
        delete oUpdate[cKey];
      }
    });

    await DB.transaction(async (trx) => {
      await trx("trs_surat_keluar")
        .where("id_surat_keluar", oPayload.id_surat_keluar)
        .update(oUpdate);

      await trx("trs_tracking_surat_keluar").insert({
        id_surat_keluar: oPayload.id_surat_keluar,
        status: oUpdate.status || oLetter.status,
        aktivitas: "surat_diupdate",
        catatan: oPayload.catatan || "Data surat keluar diperbarui",
        tanggal: dNow,
        dibuat_oleh: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });
    });

    return res.status(200).json({
      status: true,
      message: "Surat keluar berhasil diupdate",
    });
  } catch (error) {
    const oResult = {
      status: false,
      message: "Surat keluar gagal diupdate",
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

router.put("/:id_surat_keluar?", outgoingLetterUpdate);

export default router;
