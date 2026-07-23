import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";
import { sendWhatsAppMessage } from "../../../core/components/tools/wa_helper.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

const rowsFromRaw = (result) =>
  Array.isArray(result?.[0]) ? result[0] : result?.rows || result || [];

const getExistingTable = async (candidates) => {
  for (const tableName of candidates) {
    if (await DB.schema.hasTable(tableName)) return tableName;
  }

  return null;
};

const getColumns = async (tableName) => {
  if (!tableName) return [];
  const result = await DB.raw("SHOW COLUMNS FROM ??", [tableName]);
  return rowsFromRaw(result).map((column) => column.Field);
};

const pickColumn = (columns, candidates) =>
  candidates.find((columnName) => columns.includes(columnName)) || null;

const assignIfColumnExists = (target, columns, columnName, value) => {
  if (columnName && columns.includes(columnName)) target[columnName] = value;
};

const findUserReference = async (value) => {
  if (value === undefined || value === null || value === "") return true;

  const user = await DB("mst_pengguna")
    .where("id_pengguna", value)
    .first();
  return Boolean(user);
};

const findInstructionReference = async (value) => {
  if (value === undefined || value === null || value === "") return true;

  const tableName = await getExistingTable([
    "mst_instruksi_disposisi",
    "mst_disposition_instructions",
  ]);
  const columns = await getColumns(tableName);
  const idColumn = pickColumn(columns, [
    "instruksi_disposisi_id",
    "instruksi_diposisi_id",
    "disposition_instruction_id",
  ]);

  if (!tableName || !idColumn) return true;

  const instruction = await DB(tableName).where(idColumn, value).first();
  return Boolean(instruction);
};

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
      "kepada_pengguna_id.number": "kepada pengguna id harus berupa angka",
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

    const letterTable = await getExistingTable([
      "trs_surat_masuk",
      "trx_incoming_letters",
    ]);
    const dispositionTable = await getExistingTable([
      "trs_disposisi_surat",
      "trx_letter_dispositions",
    ]);
    const trackingTable = await getExistingTable([
      "trs_tracking_surat_masuk",
      "trx_incoming_letter_trackings",
    ]);

    if (!letterTable || !dispositionTable) {
      return res.status(500).json({
        status: false,
        message: "Tabel surat masuk atau disposisi belum tersedia",
      });
    }

    const letterColumns = await getColumns(letterTable);
    const dispositionColumns = await getColumns(dispositionTable);
    const trackingColumns = await getColumns(trackingTable);

    const letterIdColumn = pickColumn(letterColumns, [
      "surat_masuk_id",
      "incoming_letter_id",
    ]);
    const letterStatusColumn = pickColumn(letterColumns, ["status", "Status"]);

    const oLetter = await DB(letterTable)
      .where(letterIdColumn, oPayload.surat_masuk_id)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    if (oLetter[letterStatusColumn] === "selesai") {
      return res.status(400).json({
        status: false,
        message: "Surat masuk sudah selesai dan tidak dapat didisposisikan",
      });
    }

    const references = [
      {
        valid: await findUserReference(oPayload.dari_pengguna_id),
        label: "User asal disposisi",
      },
      {
        valid: await findUserReference(oPayload.kepada_pengguna_id),
        label: "User tujuan disposisi",
      },
      {
        valid: await findInstructionReference(oPayload.instruksi_disposisi_id),
        label: "Instruksi disposisi",
      },
    ];

    const invalidReference = references.find((reference) => !reference.valid);
    if (invalidReference) {
      return res.status(400).json({
        status: false,
        message: `${invalidReference.label} tidak ditemukan`,
      });
    }

    const dispositionIdColumn = pickColumn(dispositionColumns, [
      "disposisi_surat_id",
      "disposisi_id",
      "disid_jabatan",
    ]);
    const dispositionLetterIdColumn = pickColumn(dispositionColumns, [
      "surat_masuk_id",
      "incoming_letter_id",
    ]);
    const parentColumn = pickColumn(dispositionColumns, [
      "disposisi_induk_id",
      "parent_disposition_id",
      "parent_disid_jabatan",
    ]);
    const fromUserColumn = pickColumn(dispositionColumns, [
      "dari_pengguna_id",
      "from_id_pengguna",
      "from_nama_pengguna",
    ]);
    const toUserColumn = pickColumn(dispositionColumns, [
      "kepada_pengguna_id",
      "to_id_pengguna",
      "to_nama_pengguna",
    ]);
    const instructionIdColumn = pickColumn(dispositionColumns, [
      "instruksi_disposisi_id",
      "instruksi_diposisi_id",
      "disposition_instruction_id",
    ]);
    const instructionColumn = pickColumn(dispositionColumns, [
      "instruksi",
      "instruction",
    ]);
    const noteColumn = pickColumn(dispositionColumns, [
      "catatan_disposisi",
      "catatan_diposisi",
      "disposition_note",
    ]);
    const dueDateColumn = pickColumn(dispositionColumns, [
      "batas_waktu",
      "due_date",
    ]);

    if (oPayload.disposisi_induk_id && parentColumn && dispositionIdColumn) {
      const oParentDisposition = await DB(dispositionTable)
        .where(dispositionIdColumn, oPayload.disposisi_induk_id)
        .where(dispositionLetterIdColumn, oPayload.surat_masuk_id)
        .first();

      if (!oParentDisposition) {
        return res.status(404).json({
          status: false,
          message: "Parent disposisi tidak ditemukan pada surat ini",
        });
      }
    }

    const dNow = new Date();

    const nDispositionId = await DB.transaction(async (trx) => {
      const dispositionPayload = {};

      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        dispositionLetterIdColumn,
        oPayload.surat_masuk_id,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        parentColumn,
        oPayload.disposisi_induk_id || null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        fromUserColumn,
        oPayload.dari_pengguna_id || null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        toUserColumn,
        oPayload.kepada_pengguna_id,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        instructionIdColumn,
        oPayload.instruksi_disposisi_id || null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        instructionColumn,
        oPayload.instruksi || null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        noteColumn,
        oPayload.catatan_disposisi || null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        dueDateColumn,
        oPayload.batas_waktu || null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        "status",
        "baru",
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        "received_at",
        null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        "processed_at",
        null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        "completed_at",
        null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        "created_by",
        oPayload.created_by || null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        "updated_by",
        oPayload.updated_by || null,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        "created_at",
        dNow,
      );
      assignIfColumnExists(
        dispositionPayload,
        dispositionColumns,
        "updated_at",
        dNow,
      );

      const vaInserted = await trx(dispositionTable).insert(dispositionPayload);
      const nId = vaInserted[0];

      const letterUpdatePayload = {};
      assignIfColumnExists(
        letterUpdatePayload,
        letterColumns,
        letterStatusColumn,
        "didisposisi",
      );
      assignIfColumnExists(
        letterUpdatePayload,
        letterColumns,
        "updated_by",
        oPayload.updated_by || oPayload.created_by || null,
      );
      assignIfColumnExists(
        letterUpdatePayload,
        letterColumns,
        "updated_at",
        dNow,
      );

      if (Object.keys(letterUpdatePayload).length) {
        await trx(letterTable)
          .where(letterIdColumn, oPayload.surat_masuk_id)
          .update(letterUpdatePayload);
      }

      if (trackingTable) {
        const trackingPayload = {};
        const trackingLetterIdColumn = pickColumn(trackingColumns, [
          "surat_masuk_id",
          "incoming_letter_id",
        ]);
        const trackingDispositionIdColumn = pickColumn(trackingColumns, [
          "disposisi_surat_id",
          "disposisi_id",
          "disid_jabatan",
        ]);
        const trackingActionColumn = pickColumn(trackingColumns, [
          "nama_aksi",
          "action_name",
        ]);
        const trackingFromColumn = pickColumn(trackingColumns, [
          "dari_pengguna_id",
          "from_id_pengguna",
          "from_nama_pengguna",
        ]);
        const trackingToColumn = pickColumn(trackingColumns, [
          "kepada_pengguna_id",
          "to_id_pengguna",
          "to_nama_pengguna",
        ]);
        const previousStatusColumn = pickColumn(trackingColumns, [
          "status_sebelumnya",
          "previous_status",
        ]);
        const currentStatusColumn = pickColumn(trackingColumns, [
          "status_saat_ini",
          "current_status",
        ]);
        const trackingNoteColumn = pickColumn(trackingColumns, [
          "catatan",
          "notes",
        ]);

        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          trackingLetterIdColumn,
          oPayload.surat_masuk_id,
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          trackingDispositionIdColumn,
          nId,
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          trackingActionColumn,
          "surat_didisposisi",
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          trackingFromColumn,
          oPayload.dari_pengguna_id || null,
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          trackingToColumn,
          oPayload.kepada_pengguna_id,
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          previousStatusColumn,
          oLetter[letterStatusColumn],
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          currentStatusColumn,
          "didisposisi",
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          trackingNoteColumn,
          oPayload.catatan_disposisi ||
            oPayload.instruksi ||
            "Surat didisposisikan",
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          "processed_at",
          dNow,
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          "created_by",
          oPayload.created_by || null,
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          "created_at",
          dNow,
        );
        assignIfColumnExists(
          trackingPayload,
          trackingColumns,
          "updated_at",
          dNow,
        );

        await trx(trackingTable).insert(trackingPayload);
      }

      return nId;
    });

    // Kirim notifikasi WA secara asynchronous (fire-and-forget)
    try {
      const oPenerima = await DB("mst_pengguna").select("nama_lengkap", "no_hp").where("id_pengguna", oPayload.kepada_pengguna_id).first();
      if (oPenerima && oPenerima.no_hp) {
         const surat = await DB(letterTable).select("nomor_surat", "perihal").where(letterIdColumn, oPayload.surat_masuk_id).first();
         
         const waPesan = `Halo Bpk/Ibu ${oPenerima.nama_lengkap},

Anda mendapat lembar *Disposisi Baru* untuk ditindaklanjuti pada ${formatDateSystem()}.

Detail Disposisi:
- Nomor Surat: *${surat?.nomor_surat || '-'}*
- Perihal: *${surat?.perihal || '-'}*
- Instruksi Pimpinan: ${oPayload.instruksi || oPayload.catatan_disposisi || '-'}

Silakan buka sistem Arsip Digital Anda untuk melihat lampiran fisik surat dan menindaklanjuti disposisi ini. Terima kasih.`;
         
         // Tidak pakai await agar response API tidak terhambat
         sendWhatsAppMessage(oPenerima.no_hp, waPesan);
      }
    } catch (waErr) {
      console.error("[WA Gateway] Gagal mengirim WA Disposisi:", waErr.message);
    }

    return res.status(201).json({
      status: true,
      message: "Disposisi surat berhasil dibuat",
      data: {
        disposisi_surat_id: nDispositionId,
        disposisi_id: nDispositionId,
        disid_jabatan: nDispositionId,
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
