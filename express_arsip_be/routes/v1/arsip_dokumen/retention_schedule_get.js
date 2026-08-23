import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

const getRetentionSchedules = async (req, res) => {
  try {
    const cStatus = req.query.status || "active";
    const cKodeKategoriDokumen = req.query.kode_kategori_dokumen || req.query.document_category_code;
    const nIdKategoriDokumen = req.query.id_kategori_dokumen || req.query.document_category_id;

    const oQuery = DB("mst_jadwal_retensi as rs")
      .select(
        "rs.id_jadwal_retensi",
        "rs.kode_retensi",
        "rs.nama_retensi",
        "rs.tahun_retensi",
        "rs.tindakan_retensi",
        "rs.deskripsi",
        "rs.status",
        "dc.id_kategori_dokumen",
        "dc.kode_kategori_dokumen",
        "dc.nama_kategori_dokumen"
      )
      .leftJoin(
        "mst_kategori_dokumen as dc",
        "rs.kode_kategori_dokumen",
        "dc.kode_kategori_dokumen"
      )
      .where("rs.status", cStatus);

    if (cKodeKategoriDokumen) {
      oQuery.andWhere("rs.kode_kategori_dokumen", cKodeKategoriDokumen);
    } else if (nIdKategoriDokumen) {
      oQuery.andWhere("dc.id_kategori_dokumen", nIdKategoriDokumen);
    }

    const vaData = await oQuery.orderBy("rs.tahun_retensi", "asc");

    const oResult = {
      status: "success",
      message: "Retention schedules retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve retention schedules",
      error: error.message,
    };

    Logging(error, {
      file: "retention_schedule_get.js",
      func: "getRetentionSchedules",
      request: req.query,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

router.get("/", getRetentionSchedules);
export default router;
