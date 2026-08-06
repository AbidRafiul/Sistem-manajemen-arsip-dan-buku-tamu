import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";
import { status, datetime } from "../components/tools/general.js";

const router = express.Router();

const incomingLetterData = async (req, res) => {
  const cFile = "incoming_letter_data.js";
  const cFunc = "incomingLetterData";

  try {
    const oPayload = req.body || {};

    const oQuery = DB("trs_surat_masuk as til")
      .leftJoin("mst_jenis_surat as mlt", "til.jenis_surat_id", "mlt.jenis_surat_id")
      .leftJoin("mst_pengguna as u", "til.created_by", "u.id_pengguna")
      .select(
        "til.surat_masuk_id",
        "til.nomor_agenda",
        "til.nomor_surat",
        "til.tanggal_surat",
        "til.tanggal_diterima",
        "til.nama_pengirim",
        "til.instansi_pengirim",
        "til.perihal",
        "til.keterangan_lampiran",
        "til.jenis_surat_id",
        "mlt.nama_jenis_surat",
        "til.jenis_dokumen_id",
        "til.klasifikasi_arsip_id",
        "til.tingkat_kerahasiaan_id",
        "til.status",
        "til.created_by",
        "til.updated_by",
        "til.created_at",
        "til.updated_at",
      )
      .orderBy("til.created_at", "desc");

    // Multi-tenancy: isolasi data berdasarkan cabang pembuat surat
    applyMultiTenantFilter(oQuery, req, 'u');

    if (oPayload.keyword) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("til.nomor_agenda", "like", `%${oPayload.keyword}%`)
          .orWhere("til.nomor_surat", "like", `%${oPayload.keyword}%`)
          .orWhere("til.nama_pengirim", "like", `%${oPayload.keyword}%`)
          .orWhere("til.instansi_pengirim", "like", `%${oPayload.keyword}%`)
          .orWhere("til.perihal", "like", `%${oPayload.keyword}%`);
      });
    }

    if (oPayload.status) {
      oQuery.where("til.status", oPayload.status);
    } else {
      oQuery.whereNot("til.status", "dihapus");
    }

    if (oPayload.start_date && oPayload.end_date) {
      oQuery.whereBetween("til.tanggal_diterima", [
        oPayload.start_date,
        oPayload.end_date,
      ]);
    }

    const vaData = await oQuery;

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data surat masuk berhasil diambil",
      data: vaData,
    });
  } catch (error) {
    await Logging(error, {
      file: cFile,
      func: cFunc,
      request: JSON.stringify(req.body || {}),
      response: error.message,
      user: req?.user?.NamaPengguna || "",
    });

    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Data surat masuk gagal diambil",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterData);

export default router;
