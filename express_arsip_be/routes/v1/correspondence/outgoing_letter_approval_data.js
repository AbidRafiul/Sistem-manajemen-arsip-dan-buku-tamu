import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

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

const outgoingLetterApprovalData = async (req, res) => {
  const cFile = "outgoing_letter_approval_data.js";
  const cFunc = "outgoingLetterApprovalData";
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

    const oQuery = DB("trs_surat_keluar as tsk")
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
      );

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
      // By default, approval data shows letters that are either pending approval, approved, or rejected
      oQuery.whereIn("tsk.status", ["menunggu_approval", "disetujui", "ditolak"]);
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
      message: "Data approval surat keluar berhasil diambil",
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
      message: "Data approval surat keluar gagal diambil",
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

router.get("/", outgoingLetterApprovalData);
router.post("/", outgoingLetterApprovalData); // Allow POST request for datatable compatibility

export default router;
