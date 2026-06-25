import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const letterDispositionCreate = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      surat_masuk_id: Joi.number().required(),
      disposisi_induk_id: Joi.number().allow(null).optional(),

      dari_pengguna_id: Joi.number().allow(null).optional(),
      kepada_pengguna_id: Joi.number().required(),

      instruksi_disposisi_id: Joi.number().allow(null).optional(),

      instruksi: Joi.string().allow(null, "").optional(),
      catatan_disposisi: Joi.string().allow(null, "").optional(),
      batas_waktu: Joi.date().allow(null).optional(),

      created_by: Joi.number().allow(null).optional(),
      updated_by: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "surat_masuk_id.required": "id surat masuk wajib diisi",
      "surat_masuk_id.number": "id surat masuk harus berupa angka",

      "kepada_pengguna_id.required": "User tujuan disposisi wajib diisi",
      "kepada_pengguna_id.number": "pada pengguna id harus berupa angka",
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
      .where("surat_masuk_id", oPayload.surat_masuk_id)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    if (oLetter.status === "selesai") {
      return res.status(400).json({
        status: false,
        message: "Surat masuk sudah selesai dan tidak dapat didisposisikan",
      });
    }

    const vaReferenceChecks = [
      {
        field: "from_nama_pengguna",
        table: "mst_pengguna",
        key: "nama_pengguna",
        label: "User asal disposisi",
      },
      {
        field: "to_nama_pengguna",
        table: "mst_pengguna",
        key: "nama_pengguna",
        label: "User tujuan disposisi",
      },
      {
        field: "disposition_instruction_id",
        table: "mst_disposition_instructions",
        key: "disposition_instruction_id",
        label: "Instruksi disposisi",
      },
      {
        field: "created_by",
        table: "mst_pengguna",
        key: "nama_pengguna",
        label: "User pembuat",
      },
      {
        field: "updated_by",
        table: "mst_pengguna",
        key: "nama_pengguna",
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

    if (oPayload.parent_disposition_id) {
      const oParentDisposition = await DB("trs_disposisi_surat")
        .where("disposisi_id", oPayload.disposisi_induk_id)
        .where("surat_masuk_id", oPayload.surat_masuk_id)
        .first();

      if (!oParentDisposition) {
        return res.status(404).json({
          status: false,
          message: "Parent disposisi tidak ditemukan pada surat ini",
        });
      }
    }

    const dNow = new Date();

    const nDispositionId = await DB.transaction(async (trs) => {
      const vaInserted = await trs("trs_disposisi_surat").insert({
        surat_masuk_id: oPayload.surat_masuk_id,
        disposisi_induk_id: oPayload.disposisi_induk_id || null,

        dari_pengguna_id: oPayload.dari_pengguna_id || null,
        kepada_pengguna_id: oPayload.kepada_pengguna_id,

        instruksi_disposisi_id: oPayload.instruksi_disposisi_id || null,

        instruksi: oPayload.instruksi || null,
        catatan_disposisi: oPayload.catatan_disposisi || null,
        batas_waktu: oPayload.batas_waktu || null,

        status: "baru",
        received_at: null,
        processed_at: null,
        completed_at: null,

        created_by: oPayload.created_by || null,
        updated_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      const nId = vaInserted[0];

      await trs("trs_surat_masuk")
        .where("surat_masukload.incoming_letter_id")
        .update({
          status: "didisposisi",
          updated_by: oPayload.updated_by || oPayload.created_by || null,
          updated_at: dNow,
        });

      await trs("trx_incoming_letter_trackings").insert({
        incoming_letter_id: oPayload.incoming_letter_id,
        disid_jabatan: nId,
        action_name: "surat_didisposisi",
        from_nama_pengguna: oPayload.from_nama_pengguna || null,
        to_nama_pengguna: oPayload.to_nama_pengguna,
        previous_status: oLetter.status,
        current_status: "didisposisi",
        notes:
          oPayload.disposition_note ||
          oPayload.instruction ||
          "Surat didisposisikan",
        processed_at: dNow,
        created_by: oPayload.created_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      return nId;
    });

    return res.status(201).json({
      status: true,
      message: "Disposisi surat berhasil dibuat",
      data: {
        disid_jabatan: nDisIdJabatan,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Disposisi surat gagal dibuat",
      error: error.message,
    });
  }
};

router.post("/", letterDispositionCreate);

export default router;
