import express from "express";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem } from "../../../components/tools/general.js";
import { Logging, getDescendantBranchIds } from "../../../components/tools/servertool.js";

const router = express.Router();

router.post("/get-data", async (req, res) => {
  const oPayload = req.body;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    let query = DB("mst_unit_kerja")
      .select(
        "mst_unit_kerja.id_unit_kerja as id",
        "mst_unit_kerja.id_unit_kerja",
        "mst_unit_kerja.id_divisi",
        "mst_unit_kerja.kode_unit_kerja",
        "mst_unit_kerja.nama_unit_kerja",
        "mst_unit_kerja.deskripsi",
        "mst_unit_kerja.status"
      )
      .whereNot("mst_unit_kerja.status", "deleted");

    if (req.headers["x-filter-cabang"]) {
      const vaParentBranchIds = req.headers["x-filter-cabang"].split(",").map(Number);
      let vaAllBranchIds = [];
      if (req.headers["x-exact-cabang"] === 'true') {
        vaAllBranchIds = vaParentBranchIds;
      } else {
        for (const nBranchId of vaParentBranchIds) {
          if (!isNaN(nBranchId)) {
            const descendantIds = await getDescendantBranchIds(DB, nBranchId);
            vaAllBranchIds.push(...descendantIds);
          }
        }
      }
      if (vaAllBranchIds.length > 0) {
        query = query
          .join("mst_divisi", "mst_unit_kerja.id_divisi", "mst_divisi.id_divisi")
          .join("mst_departemen", "mst_divisi.id_departemen", "mst_departemen.id_departemen")
          .whereIn("mst_departemen.id_cabang", vaAllBranchIds);
      }
    }
    if (req.headers["x-filter-departemen"]) {
      // Jika join mst_divisi belum ada (karena x-filter-cabang kosong), kita butuh join
      if (!req.headers["x-filter-cabang"]) {
        query = query.join("mst_divisi", "mst_unit_kerja.id_divisi", "mst_divisi.id_divisi");
      }
      query = query.where("mst_divisi.id_departemen", req.headers["x-filter-departemen"]);
    }
    if (req.headers["x-filter-divisi"]) {
      query = query.where("mst_unit_kerja.id_divisi", req.headers["x-filter-divisi"]);
    }
    if (req.headers["x-filter-unit-kerja"]) {
      query = query.where("mst_unit_kerja.id_unit_kerja", req.headers["x-filter-unit-kerja"]);
    }

    const vaData = await query;

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil ditarik",
      datetime: formatDateSystem(),
      data: vaData,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Terjadi kesalahan sistem",
      datetime: formatDateSystem(),
    };
    Logging(error, { file: "get.js", func: "get", request: oPayload, response: oResult, user: cnama_pengguna });
    return res.status(500).json(oResult);
  }
});

export default router;
