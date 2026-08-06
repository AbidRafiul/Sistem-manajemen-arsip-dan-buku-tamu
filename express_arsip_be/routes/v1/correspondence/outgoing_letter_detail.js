import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { status, datetime } from "../components/tools/general.js";
import {
  Logging,
  validatePayload,
} from "../components/tools/servertool.js";

const router = express.Router();

const outgoingLetterDetail = async (req, res) => {
  const cFile = "outgoing_letter_detail.js";
  const cFunc = "outgoingLetterDetail";
  const oPayload = {
    ...(req.params || {}),
    ...(req.query || {}),
    ...(req.body || {}),
  };

  try {
    const oValidation = {
      id_surat_keluar: Joi.number().required(),
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
        status: status.BAD_REQUEST,
        message: cValidate,
      });
    }

    const oLetter = await DB("trs_surat_keluar as tsk")
      .leftJoin(
        "mst_jenis_surat as mjs",
        "tsk.id_jenis_surat",
        "mjs.jenis_surat_id"
      )
      .leftJoin("mst_template_surat as mts", "tsk.id_template", "mts.id_template")
      .select(
        "tsk.id_surat_keluar",
        "tsk.nomor_surat",
        "tsk.nomor_agenda",
        "tsk.tanggal_surat",
        "tsk.tanggal_kirim",
        "tsk.id_jenis_surat",
        "mjs.nama_jenis_surat",
        "tsk.perihal",
        "tsk.tujuan",
        "tsk.instansi_tujuan",
        "tsk.media_pengiriman",
        "tsk.id_template",
        "mts.nama_template",
        "tsk.isi_surat_final",
        "tsk.nama_pengirim",
        "tsk.jabatan",
        "tsk.status",
        "tsk.created_by",
        "tsk.updated_by",
        "tsk.created_at",
        "tsk.updated_at"
      )
      .where("tsk.id_surat_keluar", oPayload.id_surat_keluar)
      .whereNot("tsk.status", "dihapus")
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: status.BAD_REQUEST,
        message: "Surat keluar tidak ditemukan",
      });
    }

    const vaFiles = await DB("trs_file_surat_keluar")
      .select(
        "id_file_surat_keluar",
        "id_surat_keluar",
        "nama_file",
        "path_file",
        "mime_type",
        "ukuran_file",
        "tanggal_upload",
        "status",
        "created_by",
        "updated_by",
        "created_at",
        "updated_at"
      )
      .where("id_surat_keluar", oPayload.id_surat_keluar)
      .where("status", "active")
      .orderBy("tanggal_upload", "desc");

    const vaTrackings = await DB("trs_tracking_surat_keluar as tsk")
      .leftJoin("mst_pengguna as mp", "tsk.dibuat_oleh", "mp.id_pengguna")
      .select(
        "tsk.id_tracking",
        "tsk.id_surat_keluar",
        "tsk.status",
        "tsk.aktivitas",
        "tsk.catatan",
        "tsk.tanggal",
        "tsk.dibuat_oleh",
        "mp.nama_lengkap as nama_pembuat",
        "tsk.created_at",
        "tsk.updated_at"
      )
      .where("tsk.id_surat_keluar", oPayload.id_surat_keluar)
      .orderBy("tsk.tanggal", "asc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Detail surat keluar berhasil diambil",
      data: {
        surat: oLetter,
        files: vaFiles,
        trackings: vaTrackings,
      },
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Detail surat keluar gagal diambil",
    };

    await Logging(error, {
      file: cFile,
      func: cFunc,
      request: JSON.stringify(oPayload),
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
};

router.get("/:id_surat_keluar?", outgoingLetterDetail);

export default router;
