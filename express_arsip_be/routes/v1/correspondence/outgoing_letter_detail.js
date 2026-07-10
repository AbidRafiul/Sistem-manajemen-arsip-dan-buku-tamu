import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
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
        status: false,
        message: cValidate,
      });
    }

    const oLetter = await DB("trs_surat_keluar as tsk")
      .leftJoin(
        "mst_jenis_surat as mjs",
        "tsk.id_jenis_surat",
        "mjs.jenis_surat_id"
      )
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
        status: false,
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

    return res.status(200).json({
      status: true,
      message: "Detail surat keluar berhasil diambil",
      data: {
        surat: oLetter,
        files: vaFiles,
      },
    });
  } catch (error) {
    const oResult = {
      status: false,
      message: "Detail surat keluar gagal diambil",
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

router.get("/:id_surat_keluar?", outgoingLetterDetail);

export default router;
