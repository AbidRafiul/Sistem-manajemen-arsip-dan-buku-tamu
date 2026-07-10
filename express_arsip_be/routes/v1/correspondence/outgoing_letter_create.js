import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import {
  Logging,
  validatePayload,
} from "../components/tools/servertool.js";

const router = express.Router();
const AGENDA_PREFIX = "SK";
const AGENDA_SEQUENCE_LENGTH = 4;

const getAgendaYear = () =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(new Date());

const generateAgendaNumber = async (trx) => {
  const cYear = getAgendaYear();
  const cPrefix = `${AGENDA_PREFIX}-${cYear}-`;
  const oLastAgenda = await trx("trs_surat_keluar")
    .select("nomor_agenda")
    .where("nomor_agenda", "like", `${cPrefix}%`)
    .orderBy("nomor_agenda", "desc")
    .forUpdate()
    .first();

  const cLastSequence = String(oLastAgenda?.nomor_agenda || "").slice(
    cPrefix.length
  );
  const nLastSequence = /^\d+$/.test(cLastSequence)
    ? Number(cLastSequence)
    : 0;
  const cNextSequence = String(nLastSequence + 1).padStart(
    AGENDA_SEQUENCE_LENGTH,
    "0"
  );

  return `${cPrefix}${cNextSequence}`;
};

const checkReference = async ({ table, key, value, label }) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const oData = await DB(table).where(key, value).first();
  return oData ? null : `${label} tidak ditemukan`;
};

const outgoingLetterCreate = async (req, res) => {
  const cFile = "outgoing_letter_create.js";
  const cFunc = "outgoingLetterCreate";
  const oPayload = req.body || {};

  try {
    if (!oPayload.nomor_agenda) {
      delete oPayload.nomor_agenda;
    }

    const oValidation = {
      nomor_surat: Joi.string().max(100).required(),
      nomor_agenda: Joi.string().max(100).optional(),
      tanggal_surat: Joi.date().required(),
      tanggal_kirim: Joi.date().allow(null).optional(),
      id_jenis_surat: Joi.number().required(),
      perihal: Joi.string().max(255).required(),
      tujuan: Joi.string().max(150).required(),
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
      created_by: Joi.number().allow(null).optional(),
      updated_by: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "nomor_surat.required": "Nomor surat wajib diisi",
      "tanggal_surat.required": "Tanggal surat wajib diisi",
      "id_jenis_surat.required": "Jenis surat wajib dipilih",
      "perihal.required": "Perihal wajib diisi",
      "tujuan.required": "Tujuan wajib diisi",
      "any.only": "Status surat keluar tidak valid",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      uniqueField: ["nomor_agenda"],
      table: "trs_surat_keluar",
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
        table: "mst_jenis_surat",
        key: "jenis_surat_id",
        value: oPayload.id_jenis_surat,
        label: "Jenis surat",
      },
      {
        table: "mst_pengguna",
        key: "id_pengguna",
        value: oPayload.created_by,
        label: "User pembuat",
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
    const nOutgoingLetterId = await DB.transaction(async (trx) => {
      const cNomorAgenda =
        oPayload.nomor_agenda || (await generateAgendaNumber(trx));
      const cStatus = oPayload.status || "draft";

      const vaInserted = await trx("trs_surat_keluar").insert({
        nomor_surat: oPayload.nomor_surat,
        nomor_agenda: cNomorAgenda,
        tanggal_surat: oPayload.tanggal_surat,
        tanggal_kirim: oPayload.tanggal_kirim || null,
        id_jenis_surat: oPayload.id_jenis_surat,
        perihal: oPayload.perihal,
        tujuan: oPayload.tujuan,
        instansi_tujuan: oPayload.instansi_tujuan || null,
        media_pengiriman: oPayload.media_pengiriman || null,
        status: cStatus,
        created_by: oPayload.created_by || null,
        updated_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      const nId = vaInserted[0];

      await trx("trs_tracking_surat_keluar").insert({
        id_surat_keluar: nId,
        status: cStatus,
        aktivitas: "surat_dibuat",
        catatan: "Surat keluar dibuat",
        tanggal: dNow,
        dibuat_oleh: oPayload.created_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      return nId;
    });

    return res.status(201).json({
      status: true,
      message: "Surat keluar berhasil dibuat",
      data: {
        id_surat_keluar: nOutgoingLetterId,
      },
    });
  } catch (error) {
    const oResult = {
      status: false,
      message: "Surat keluar gagal dibuat",
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

router.post("/", outgoingLetterCreate);

export default router;
