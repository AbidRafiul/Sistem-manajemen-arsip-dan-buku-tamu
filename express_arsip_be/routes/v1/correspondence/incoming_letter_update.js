import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterUpdate = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      surat_masuk_id: Joi.number().required(),

      nomor_agenda: Joi.string().max(100).optional(),
      nomor_surat: Joi.string().max(100).optional(),
      tanggal_surat: Joi.date().optional(),
      tanggal_diterima: Joi.date().optional(),
      nama_pengirim: Joi.string().max(150).optional(),
      instansi_pengirim: Joi.string().max(150).allow(null, "").optional(),
      perihal: Joi.string().max(255).optional(),
      keterangan_lampiran: Joi.string().allow(null, "").optional(),

      jenis_surat_id: Joi.number().allow(null).optional(),
      jenis_dokumen_id: Joi.number().allow(null).optional(),
      klasifikasi_arsip_id: Joi.number().allow(null).optional(),
      tingkat_kerahasiaan_id: Joi.number().allow(null).optional(),

      status: Joi.string()
        .valid("baru", "diproses", "didisposisi", "selesai")
        .optional(),

      updated_by: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "surat_masuk_id.required": "id surat masuk wajib diisi",
      "surat_masuk_id.number": "id surat masuk harus berupa angka",

      "nomor_agenda.max": "Nomor agenda maksimal 100 karakter",
      "nomor_surat.max": "Nomor surat maksimal 100 karakter",
      "nama_pengirim.max": "Nama pengirim maksimal 150 karakter",
      "perihal.max": "Perihal maksimal 255 karakter",

      "status.valid":
        "status hanya boleh baru, diproses, didisposisi, atau selesai",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      uniqueField: ["nomor_agenda"],
      table: "trs_surat_masuk",
      excludedField: "surat_masuk_id",
      allowUnknown: false,
    });

    if (cValidate) {
      return res.status(400).json({
        status: false,
        message: cValidate,
      });
    }

    const oLetter = await DB("trs_surat_masuk")
      .where("surat_masuk_id", oPayload.incoming_letter_id)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
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

    const oUpdate = {
      nomor_agenda: oPayload.agenda_number,
      nomor_surat: oPayload.letter_number,
      tanggal_surat: oPayload.letter_date,
      tanggal_diterima: oPayload.received_date,
      nama_pengirim: oPayload.sender_name,
      instansi_pengirim: oPayload.sender_institution,
      perihal: oPayload.subject,
      keterangan_lampiran: oPayload.attachment_description,
      surat_masuk_id: oPayload.letter_type_id,
      jenis_dokumen_id: oPayload.document_type_id,
      archive_classification_id: oPayload.archive_classification_id,
      confidentiality_level_id: oPayload.confidentiality_level_id,
      status: oPayload.status,
      updated_by: oPayload.updated_by || null,
      updated_at: dNow,
    };

    Object.keys(oUpdate).forEach((cKey) => {
      if (oUpdate[cKey] === undefined) {
        delete oUpdate[cKey];
      }
    });

    await DB.transaction(async (trx) => {
      await trx("trs_surat_masuk")
        .where("surat_masuk_id", oPayload.incoming_letter_id)
        .update(oUpdate);

      await trx("trs_tracking_surat_masuk").insert({
        incoming_letter_id: oPayload.incoming_letter_id,
        disposition_id: null,
        action_name: "surat_diupdate",
        from_user_id: null,
        to_user_id: null,
        previous_status: oLetter.status,
        current_status: oUpdate.status || oLetter.status,
        notes: "Data surat masuk diperbarui",
        processed_at: dNow,
        created_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });
    });

    return res.status(200).json({
      status: true,
      message: "Surat masuk berhasil diupdate",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Surat masuk gagal diupdate",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterUpdate);

export default router;
