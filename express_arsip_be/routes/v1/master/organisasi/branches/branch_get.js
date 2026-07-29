import express from "express";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem } from "../../../components/tools/general.js";
import { Logging, getDescendantBranchIds } from "../../../components/tools/servertool.js";

const router = express.Router();

router.post("/get_data", async (req, res) => {
  const oPayload = req.body;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    let query = DB("mst_cabang as c")
      .leftJoin("mst_cabang as induk", "c.id_induk", "induk.id_cabang")
      .select(
        "c.id_cabang as id",
        "c.id_cabang",
        "c.id_induk",
        "induk.nama_cabang as nama_induk",
        "c.kode_cabang",
        "c.nama_cabang",
        "c.alamat",
        "c.telepon",
        "c.surel",
        "c.status"
      )
      .whereNot("c.status", "deleted");

    if (req.headers["x-filter-cabang"]) {
      const parentBranchIds = req.headers["x-filter-cabang"].split(",").map(Number);
      let allBranchIds = [];
      if (req.headers["x-exact-cabang"] === 'true') {
        allBranchIds = parentBranchIds;
      } else {
        for (const bId of parentBranchIds) {
          if (!isNaN(bId)) {
            const descendantIds = await getDescendantBranchIds(DB, bId);
            allBranchIds.push(...descendantIds);
          }
        }
      }
      if (allBranchIds.length > 0) {
        query = query.whereIn("c.id_cabang", allBranchIds);
      }
    }

    // Urutkan berdasarkan hierarki: Pusat (null) -> Cabang Daerah -> Unit Kecamatan
    // Khusus untuk BR-PST (Kantor Pusat Demo) ditaruh paling bawah
    query = query
      .orderByRaw("CASE WHEN c.kode_cabang = 'BR-PST' THEN 1 ELSE 0 END ASC")
      .orderBy("c.id_induk", "asc")
      .orderBy("c.id_cabang", "asc");

    const vaData = await query;

    // Calculate absolute hierarchy level for each branch
    const allCabangs = await DB("mst_cabang").select("id_cabang", "id_induk");
    const parentMap = {};
    for (const c of allCabangs) {
      parentMap[c.id_cabang] = c.id_induk;
    }

    for (const row of vaData) {
      let level = 1;
      let curr = row.id_induk;
      while (curr) {
        level++;
        curr = parentMap[curr];
      }
      row.level = level;
    }

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