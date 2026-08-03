import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { CAKUPAN_SEQUENCE_OPTIONS, PERIODE_RESET_OPTIONS, TAHAP_PENERBITAN_OPTIONS } from "../../components/tools/letter_numbering_service.js";
export const baseValidation = {
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
  updated_by: Joi.number().integer().positive().allow(null).optional()
};
export const validationMessages = {
  "any.required": "{#label} wajib diisi",
  "string.empty": "{#label} tidak boleh kosong",
  "string.max": "{#label} maksimal {#limit} karakter",
  "number.positive": "{#label} harus lebih dari 0",
  "any.only": "{#label} tidak valid"
};
export const checkReference = async ({
  table,
  key,
  value,
  label
}) => {
  if (value === undefined || value === null || value === "") return null;
  const vaData = await DB(table).where(key, value).first();
  return vaData ? null : `${label} tidak ditemukan`;
};
export const ensureActiveUniqueness = async ({
  jenis_surat_id,
  status_aktif,
  excludeId
}) => {
  if (Number(status_aktif ?? 1) !== 1) return null;
  const query = DB("mst_penomoran_surat").where("jenis_surat_id", jenis_surat_id).where("status_aktif", 1);
  if (excludeId) query.whereNot("id_penomoran_surat", excludeId);
  const existing = await query.first();
  return existing ? "Jenis surat ini sudah memiliki konfigurasi penomoran aktif" : null;
};
export const normalizePayload = payload => ({
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
  updated_by: payload.updated_by || null
});