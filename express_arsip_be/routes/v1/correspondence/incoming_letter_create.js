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
      jenis_surat_id: Joi.number().allow(null).optional(),
      jenis_dokumen_id: Joi.number().allow(null).optional(),
      klarifikasi_arsip_id: Joi.number().allow(null).optional(),
      tingkat_kerahasiaan_id: Joi.number().allow(null).optional(),
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
        field: "jenis_dokumen_id",
        table: "mst_jenis_dokumen",
        key: "DocumentTypeId",
        label: "Tipe dokumen",
      },
      {
        field: "archive_classification_id",
        table: "mst_archive_classifications",
        key: "ArchiveClassificationId",
        label: "Klasifikasi arsip",
      },
      {
        field: "confidentiality_level_id",
        table: "mst_confidentiality_levels",
        key: "ConfidentialityLevelId",
        label: "Level kerahasiaan",
      },
      {
        field: "created_by",
        table: "mst_users",
        key: "UserId",
        label: "User pembuat",
      },
      {
        field: "updated_by",
        table: "mst_users",
        key: "UserId",
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
      const vaInserted = await trx("trx_incoming_letters").insert({
        nomor_agenda: oPayload.agenda_number,
        nomor_surat: oPayload.letter_number,
        tanggal_surat: oPayload.letter_date,
        tanggal_diterima: oPayload.received_date,
        nama_pengirim: oPayload.sender_name,
        instansi_pengirim: oPayload.sender_institution || null,
        perihal: oPayload.subject,
        attachment_description: oPayload.attachment_description || null,
        jenis_surat_id: oPayload.letter_type_id || null,
        jenis_dokumen_id: oPayload.document_type_id || null,
        archive_classification_id: oPayload.archive_classification_id || null,
        confidentiality_level_id: oPayload.confidentiality_level_id || null,
        status: "baru",
        created_by: oPayload.created_by || null,
        updated_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      const nId = vaInserted[0];

      await trx("trs_tracking_surat_masuk").insert({
        surat_masuk_id: nId,
        disposisi_id: null,
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
        incoming_letter_id: nIncomingLetterId,
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
