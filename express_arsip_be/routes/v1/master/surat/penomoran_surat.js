import express from "express";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import {
  CAKUPAN_SEQUENCE_OPTIONS,
  NUMBERING_TOKENS,
  PERIODE_RESET_OPTIONS,
  TAHAP_PENERBITAN_OPTIONS,
  previewActiveNomorSurat,
  previewNomorSurat,
  validateNumberingFormat,
} from "../../components/tools/letter_numbering_service.js";
import { datetime, formatDateSystem, status } from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";

const router = express.Router();

const baseValidation = {
  nama_penomoran: Joi.string().trim().max(150).required().label("Nama Penomoran"),
  jenis_surat_id: Joi.number().integer().positive().required().label("Jenis Surat"),
  format_nomor: Joi.string().trim().max(255).required().label("Format Nomor"),
  jumlah_digit: Joi.number().integer().positive().required().label("Jumlah Digit"),
  nomor_awal: Joi.number().integer().positive().required().label("Nomor Awal"),
  periode_reset: Joi.string().valid(...PERIODE_RESET_OPTIONS).required().label("Periode Reset"),
  cakupan_sequence: Joi.string().valid(...CAKUPAN_SEQUENCE_OPTIONS).required().label("Cakupan Sequence"),
  tahap_penerbitan_nomor: Joi.string().valid(...TAHAP_PENERBITAN_OPTIONS).required().label("Tahap Penerbitan Nomor"),
  status_aktif: Joi.number().valid(0, 1).optional().label("Status Aktif"),
  id_penomoran_surat: Joi.number().integer().positive().allow(null).optional().label("ID Penomoran Surat"),
  created_by: Joi.number().integer().positive().allow(null).optional(),
  updated_by: Joi.number().integer().positive().allow(null).optional(),
};

const validationMessages = {
  "any.required": "{#label} wajib diisi",
  "string.empty": "{#label} tidak boleh kosong",
  "string.max": "{#label} maksimal {#limit} karakter",
  "number.positive": "{#label} harus lebih dari 0",
  "any.only": "{#label} tidak valid",
};

const checkReference = async ({ table, key, value, label }) => {
  if (value === undefined || value === null || value === "") return null;

  const data = await DB(table).where(key, value).first();
  return data ? null : `${label} tidak ditemukan`;
};

const ensureActiveUniqueness = async ({ jenis_surat_id, status_aktif, excludeId }) => {
  if (Number(status_aktif ?? 1) !== 1) return null;

  const query = DB("mst_penomoran_surat")
    .where("jenis_surat_id", jenis_surat_id)
    .where("status_aktif", 1);

  if (excludeId) query.whereNot("id_penomoran_surat", excludeId);

  const existing = await query.first();
  return existing
    ? "Jenis surat ini sudah memiliki konfigurasi penomoran aktif"
    : null;
};

const normalizePayload = (payload) => ({
  nama_penomoran: String(payload.nama_penomoran || "").trim(),
  jenis_surat_id: Number(payload.jenis_surat_id),
  format_nomor: String(payload.format_nomor || "").trim(),
  jumlah_digit: Number(payload.jumlah_digit || 3),
  nomor_awal: Number(payload.nomor_awal || 1),
  periode_reset: payload.periode_reset || "tahunan",
  cakupan_sequence: payload.cakupan_sequence || "per_jenis_surat",
  tahap_penerbitan_nomor: payload.tahap_penerbitan_nomor || "saat_draft_dibuat",
  status_aktif: Number(payload.status_aktif ?? 1),
  created_by: payload.created_by || null,
  updated_by: payload.updated_by || null,
});

router.get("/tokens", async (req, res) => {
  return res.status(200).json({
    status: status.SUKSES,
    message: "Token penomoran surat berhasil diambil",
    datetime: formatDateSystem(),
    data: NUMBERING_TOKENS,
  });
});

router.post("/preview", async (req, res) => {
  try {
    const validation = await validatePayload(
      {
        format_nomor: Joi.string().trim().max(255).required().label("Format Nomor"),
        jumlah_digit: Joi.number().integer().positive().required().label("Jumlah Digit"),
        nomor: Joi.number().integer().positive().required().label("Nomor"),
        jenis_surat_id: Joi.number().integer().positive().allow(null).optional().label("Jenis Surat"),
        id_unit_kerja: Joi.number().integer().positive().allow(null).optional().label("Unit Kerja"),
        tanggal_surat: Joi.date().allow(null).optional().label("Tanggal Surat"),
      },
      validationMessages,
      req.body || {}
    );

    if (validation) {
      return res.status(422).json({ status: status.BAD_REQUEST, message: validation, datetime: datetime() });
    }

    const nomor_surat = await previewNomorSurat(DB, req.body || {});

    return res.status(200).json({
      status: status.SUKSES,
      message: "Preview nomor surat berhasil dibuat",
      datetime: formatDateSystem(),
      data: { nomor_surat },
    });
  } catch (error) {
    return res.status(400).json({
      status: status.BAD_REQUEST,
      message: error.message || "Preview nomor surat gagal dibuat",
      datetime: datetime(),
    });
  }
});

router.post("/preview-aktif", async (req, res) => {
  try {
    const validation = await validatePayload(
      {
        jenis_surat_id: Joi.number().integer().positive().required().label("Jenis Surat"),
        id_unit_kerja: Joi.number().integer().positive().allow(null).optional().label("Unit Kerja"),
        tanggal_surat: Joi.date().allow(null).optional().label("Tanggal Surat"),
      },
      validationMessages,
      req.body || {}
    );

    if (validation) {
      return res.status(422).json({ status: status.BAD_REQUEST, message: validation, datetime: datetime() });
    }

    const nomor_surat = await previewActiveNomorSurat(DB, {
      jenisSuratId: Number(req.body?.jenis_surat_id),
      unitKerjaId:
        req.body?.id_unit_kerja ||
        req?.auth?.id_unit_kerja ||
        req?.context?.id_unit_kerja ||
        req?.headers?.["x-filter-unit-kerja"] ||
        null,
      tanggalSurat: req.body?.tanggal_surat,
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Preview nomor surat aktif berhasil dibuat",
      datetime: formatDateSystem(),
      data: { nomor_surat },
    });
  } catch (error) {
    return res.status(400).json({
      status: status.BAD_REQUEST,
      message: error.message || "Preview nomor surat aktif gagal dibuat",
      datetime: datetime(),
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const keyword = String(req.query?.keyword || req.query?.search || "").trim();
    const query = DB("mst_penomoran_surat as mps")
      .leftJoin("mst_jenis_surat as mjs", "mps.jenis_surat_id", "mjs.jenis_surat_id")
      .select(
        "mps.id_penomoran_surat",
        "mps.nama_penomoran",
        "mps.jenis_surat_id",
        "mjs.kode_jenis_surat",
        "mjs.nama_jenis_surat",
        "mps.format_nomor",
        "mps.jumlah_digit",
        "mps.nomor_awal",
        "mps.periode_reset",
        "mps.cakupan_sequence",
        "mps.tahap_penerbitan_nomor",
        "mps.status_aktif",
        "mps.created_by",
        "mps.updated_by",
        "mps.created_at",
        "mps.updated_at"
      );

    if (keyword) {
      query.where((builder) => {
        builder
          .where("mps.nama_penomoran", "like", `%${keyword}%`)
          .orWhere("mps.format_nomor", "like", `%${keyword}%`)
          .orWhere("mjs.nama_jenis_surat", "like", `%${keyword}%`);
      });
    }

    if (req.query?.status_aktif !== undefined && req.query.status_aktif !== "") {
      query.where("mps.status_aktif", Number(req.query.status_aktif));
    }

    if (req.query?.jenis_surat_id) {
      query.where("mps.jenis_surat_id", Number(req.query.jenis_surat_id));
    }

    const data = await query.orderBy("mps.updated_at", "desc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data penomoran surat berhasil diambil",
      datetime: formatDateSystem(),
      data,
      total_data: data.length,
    });
  } catch (error) {
    await Logging(error, { file: "penomoran_surat.js", func: "get", request: req.query, user: req?.auth?.nama_pengguna || "" });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Data penomoran surat gagal diambil", datetime: datetime() });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await DB("mst_penomoran_surat as mps")
      .leftJoin("mst_jenis_surat as mjs", "mps.jenis_surat_id", "mjs.jenis_surat_id")
      .select("mps.*", "mjs.kode_jenis_surat", "mjs.nama_jenis_surat")
      .where("mps.id_penomoran_surat", req.params.id)
      .first();

    if (!data) {
      return res.status(404).json({ status: status.NOT_FOUND, message: "Penomoran surat tidak ditemukan", datetime: datetime() });
    }

    return res.status(200).json({ status: status.SUKSES, message: "Detail penomoran surat berhasil diambil", datetime: formatDateSystem(), data });
  } catch (error) {
    await Logging(error, { file: "penomoran_surat.js", func: "detail", request: req.params, user: req?.auth?.nama_pengguna || "" });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Detail penomoran surat gagal diambil", datetime: datetime() });
  }
});

router.post("/", async (req, res) => {
  const payload = normalizePayload(req.body || {});

  try {
    const validation = await validatePayload(baseValidation, validationMessages, req.body || {});
    if (validation) {
      return res.status(422).json({ status: status.BAD_REQUEST, message: validation, datetime: datetime() });
    }

    const formatError = validateNumberingFormat(payload.format_nomor);
    if (formatError) {
      return res.status(422).json({ status: status.BAD_REQUEST, message: formatError, datetime: datetime() });
    }

    const referenceError = await checkReference({
      table: "mst_jenis_surat",
      key: "jenis_surat_id",
      value: payload.jenis_surat_id,
      label: "Jenis surat",
    });
    if (referenceError) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: referenceError, datetime: datetime() });
    }

    const uniqueError = await ensureActiveUniqueness(payload);
    if (uniqueError) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: uniqueError, datetime: datetime() });
    }

    const now = new Date();
    const inserted = await DB("mst_penomoran_surat").insert({
      ...payload,
      updated_by: payload.updated_by || payload.created_by || null,
      created_at: now,
      updated_at: now,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "Penomoran surat berhasil dibuat",
      datetime: formatDateSystem(),
      data: { id_penomoran_surat: inserted[0] },
    });
  } catch (error) {
    await Logging(error, { file: "penomoran_surat.js", func: "create", request: payload, user: req?.auth?.nama_pengguna || "" });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Penomoran surat gagal dibuat", datetime: datetime() });
  }
});

router.put("/:id", async (req, res) => {
  const payload = normalizePayload(req.body || {});

  try {
    const validation = await validatePayload(baseValidation, validationMessages, req.body || {});
    if (validation) {
      return res.status(422).json({ status: status.BAD_REQUEST, message: validation, datetime: datetime() });
    }

    const formatError = validateNumberingFormat(payload.format_nomor);
    if (formatError) {
      return res.status(422).json({ status: status.BAD_REQUEST, message: formatError, datetime: datetime() });
    }

    const existing = await DB("mst_penomoran_surat").where("id_penomoran_surat", req.params.id).first();
    if (!existing) {
      return res.status(404).json({ status: status.NOT_FOUND, message: "Penomoran surat tidak ditemukan", datetime: datetime() });
    }

    const uniqueError = await ensureActiveUniqueness({
      ...payload,
      excludeId: req.params.id,
    });
    if (uniqueError) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: uniqueError, datetime: datetime() });
    }

    await DB("mst_penomoran_surat")
      .where("id_penomoran_surat", req.params.id)
      .update({
        ...payload,
        created_by: existing.created_by,
        updated_at: new Date(),
      });

    return res.status(200).json({ status: status.SUKSES, message: "Penomoran surat berhasil diupdate", datetime: formatDateSystem() });
  } catch (error) {
    await Logging(error, { file: "penomoran_surat.js", func: "update", request: payload, user: req?.auth?.nama_pengguna || "" });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Penomoran surat gagal diupdate", datetime: datetime() });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const used = await DB("trs_sequence_penomoran_surat")
      .where("id_penomoran_surat", req.params.id)
      .first();

    const updated = await DB("mst_penomoran_surat")
      .where("id_penomoran_surat", req.params.id)
      .update({
        status_aktif: 0,
        updated_by: req.body?.updated_by || null,
        updated_at: new Date(),
      });

    if (!updated) {
      return res.status(404).json({ status: status.NOT_FOUND, message: "Penomoran surat tidak ditemukan", datetime: datetime() });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: used
        ? "Penomoran surat sudah digunakan, data dinonaktifkan"
        : "Penomoran surat berhasil dinonaktifkan",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    await Logging(error, { file: "penomoran_surat.js", func: "delete", request: req.params, user: req?.auth?.nama_pengguna || "" });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Penomoran surat gagal dinonaktifkan", datetime: datetime() });
  }
});

export default router;
