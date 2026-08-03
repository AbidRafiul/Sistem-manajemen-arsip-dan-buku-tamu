import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";

const router = express.Router();

const SORT_COLUMNS = {
  id_surat_keluar: "tsk.id_surat_keluar",
  nomor_surat: "tsk.nomor_surat",
  nomor_agenda: "tsk.nomor_agenda",
  tanggal_surat: "tsk.tanggal_surat",
  tanggal_kirim: "tsk.tanggal_kirim",
  id_jenis_surat: "tsk.id_jenis_surat",
  status: "tsk.status",
  created_at: "tsk.created_at",
  updated_at: "tsk.updated_at",
};

const toPositiveNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

const outgoingLetterData = async (req, res) => {
  const cFile = "outgoing_letter_data.js";
  const cFunc = "outgoingLetterData";
  const oPayload = {
    ...(req.query || {}),
    ...(req.body || {}),
  };

  try {
    const nPage = toPositiveNumber(oPayload.page, 1);
    const nLimit = Math.min(toPositiveNumber(oPayload.limit, 10), 100);
    const nOffset = (nPage - 1) * nLimit;
    const cKeyword = oPayload.keyword || oPayload.search || "";
    const cSortBy = SORT_COLUMNS[oPayload.sort_by] || SORT_COLUMNS.created_at;
    const cSortOrder =
      String(oPayload.sort_order || "desc").toLowerCase() === "asc"
        ? "asc"
        : "desc";

    const latestFileSubquery = DB("trs_file_surat_keluar as tf")
      .select("tf.id_surat_keluar")
      .max("tf.id_file_surat_keluar as id_file_surat_keluar")
      .where("tf.status", "active")
      .groupBy("tf.id_surat_keluar");

    const oQuery = DB("trs_surat_keluar as tsk")
      .leftJoin(
        "mst_jenis_surat as mjs",
        "tsk.id_jenis_surat",
        "mjs.jenis_surat_id"
      )
      .leftJoin("mst_template_surat as mts", "tsk.id_template", "mts.id_template")
      .leftJoin("mst_pengguna as u", "tsk.created_by", "u.id_pengguna")
      .leftJoin({ tff_latest: latestFileSubquery }, "tsk.id_surat_keluar", "tff_latest.id_surat_keluar")
      .leftJoin("trs_file_surat_keluar as tf", "tf.id_file_surat_keluar", "tff_latest.id_file_surat_keluar")
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
        "tf.nama_file",
        "tf.mime_type",
        "tf.ukuran_file",
        "tf.tanggal_upload",
        "tf.path_file",
        "tsk.isi_surat_final",
        "tsk.nama_pengirim",
        "tsk.jabatan",
        "tsk.status",
        "tsk.created_by",
        "tsk.updated_by",
        "tsk.created_at",
        "tsk.updated_at"
      );

    // Multi-tenancy: isolasi data berdasarkan cabang pembuat surat
    applyMultiTenantFilter(oQuery, req, 'u');

    if (cKeyword) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("tsk.nomor_surat", "like", `%${cKeyword}%`)
          .orWhere("tsk.nomor_agenda", "like", `%${cKeyword}%`)
          .orWhere("tsk.perihal", "like", `%${cKeyword}%`)
          .orWhere("tsk.tujuan", "like", `%${cKeyword}%`)
          .orWhere("tsk.instansi_tujuan", "like", `%${cKeyword}%`);
      });
    }

    if (oPayload.status) {
      oQuery.where("tsk.status", oPayload.status);
    } else {
      oQuery.whereNot("tsk.status", "dihapus");
    }

    if (oPayload.id_jenis_surat) {
      oQuery.where("tsk.id_jenis_surat", oPayload.id_jenis_surat);
    }

    const vaTotal = await oQuery
      .clone()
      .clearSelect()
      .clearOrder()
      .count({ total_data: "tsk.id_surat_keluar" });
    const nTotalData = Number(vaTotal?.[0]?.total_data || 0);

    const vaData = await oQuery.orderBy(cSortBy, cSortOrder).limit(nLimit).offset(nOffset);

    return res.status(200).json({
      status: true,
      message: "Data surat keluar berhasil diambil",
      data: vaData,
      pagination: {
        page: nPage,
        limit: nLimit,
        total_data: nTotalData,
        total_page: Math.ceil(nTotalData / nLimit),
      },
    });
  } catch (error) {
    const oResult = {
      status: false,
      message: "Data surat keluar gagal diambil",
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

router.get("/", outgoingLetterData);

export default router;
