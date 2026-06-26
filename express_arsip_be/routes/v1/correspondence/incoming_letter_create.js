import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterCreate = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      nomor_agenda: Joi.string().max(100).required(),
      nomor_surat: Joi.string().max(100).required(),
      tanggal_surat: Joi.date().required(),
      tanggal_diterima: Joi.date().required(),
      nama_pengirim: Joi.string().max(150).required(),
      instansi_pengirim: Joi.string().max(150).allow(null, "").optional(),
      perihal: Joi.string().max(255).required(),
      keterangan_lampiran: Joi.string().allow(null, "").optional(),
      jenis_surat_id: Joi.number().required(),
      jenis_dokumen_id: Joi.number().allow(null).optional(),
      archive_classification_id: Joi.number().allow(null).optional(),
      confidentiality_level_id: Joi.number().allow(null).optional(),
      created_by: Joi.number().allow(null).optional(),
      updated_by: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "nomor_agenda.required": "Nomor agenda wajib diisi",
      "nomor_surat.required": "Nomor surat wajib diisi",
      "tanggal_surat.required": "Tanggal surat wajib diisi",
      "tanggal_diterima.required": "Tanggal diterima wajib diisi",
      "nama_pengirim.required": "Pengirim wajib diisi",
      "perihal.required": "Perihal wajib diisi",
      "jenis_surat_id.required": "Jenis surat wajib dipilih",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      uniqueField: ["nomor_agenda"],
      table: "trs_surat_masuk",
      allowUnknown: false,
    });

    if (cValidate) {
      return res.status(400).json({
        status: false,
        message: cValidate,
      });
    }

    const vaReferenceChecks = [
      {
        field: "jenis_surat_id",
        table: "mst_jenis_surat",
        key: "jenis_surat_id",
        label: "Jenis surat",
      },
      {
        field: "document_type_id",
        table: "mst_jenis_dokumen",
        key: "id_jenis_dokumen",

        label: "Tipe dokumen",
      },
      {
        field: "archive_classification_id",
        table: "mst_klasifikasi_arsip",
        key: "id_klasifikasi",
        label: "Klasifikasi arsip",
      },
      {
        field: "confidentiality_level_id",
        table: "mst_tingkat_kerahasiaan",
        key: "id_tingkat_kerahasiaan",
        label: "Level kerahasiaan",
      },
      {
        field: "created_by",
        table: "mst_pengguna",
        key: "user_id",
        label: "User pembuat",
      },
      {
        field: "updated_by",
        table: "mst_pengguna",
        key: "user_id",
        label: "User pengubah",
      },
    ];

    for (const oReference of vaReferenceChecks) {
      const value = oPayload[oReference.field];

      if (value === undefined || value === null || value === "") {
        continue;
      }

      const oData = await DB(oReference.table)
        .where(oReference.key, value)
        .first();

      if (!oData) {
        return res.status(400).json({
          status: false,
          message: `${oReference.label} tidak ditemukan`,
        });
      }
    }

    const dNow = new Date();

    const nIncomingLetterId = await DB.transaction(async (trx) => {
      const vaInserted = await trx("trs_surat_masuk").insert({
        nomor_agenda: oPayload.nomor_agenda,
        nomor_surat: oPayload.nomor_surat,
        tanggal_surat: oPayload.tanggal_surat,
        tanggal_diterima: oPayload.tanggal_diterima,
        nama_pengirim: oPayload.nama_pengirim,
        instansi_pengirim: oPayload.instansi_pengirim || null,
        perihal: oPayload.perihal,
        keterangan_lampiran: oPayload.keterangan_lampiran || null,
        jenis_surat_id: oPayload.jenis_surat_id,
        jenis_dokumen_id: oPayload.jenis_dokumen_id || null,
        klasifikasi_arsip_id: oPayload.archive_classification_id || null,
        tingkat_kerahasiaan_id: oPayload.confidentiality_level_id || null,
        status: "baru",
        created_by: oPayload.created_by || null,
        updated_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      const nId = vaInserted[0];

      await trx("trs_tracking_surat_masuk").insert({
        surat_masuk_id: nId,
        disposisi_surat_id: null,
        nama_aksi: "surat_dibuat",
        dari_pengguna_id: null,
        kepada_pengguna_id: null,
        status_sebelumnya: null,
        status_saat_ini: "baru",
        catatan: "Surat masuk dibuat",
        processed_at: dNow,
        created_by: oPayload.created_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      return nId;
    });

    return res.status(201).json({
      status: true,
      message: "Surat masuk berhasil dibuat",
      data: {
        surat_masuk_id: nIncomingLetterId,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Surat masuk gagal dibuat",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterCreate);

export default router;
