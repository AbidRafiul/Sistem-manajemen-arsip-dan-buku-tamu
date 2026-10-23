import express from "express";
import DB from "../../../../core/config/knex.js";
import { Logging } from "../../components/tools/servertool.js";
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const rawData = await DB("mst_menu")
      .select(
        "id_menu as id",
        "id_menu as id_menu",
        "id_menu_induk as id_menu_induk",
        "kode_menu as kode_menu",
        "nama_menu as name",
        "nama_menu as nama_menu",
        "jalur_menu as jalur_menu",
        "ikon_menu as ikon_menu",
        "urutan as urutan",
        "status_aktif as status_aktif"
      )
      .where("status_aktif", ">=", 0)
      .orderBy("urutan", "asc");

    // Ambil mapping peran menu agar saat edit form hak akses peran terisi
    const peranMenus = await DB("mst_peran_menu").select("id_menu", "id_peran");
    const peranMap = {};
    for (const pm of peranMenus) {
      if (!peranMap[pm.id_menu]) peranMap[pm.id_menu] = [];
      peranMap[pm.id_menu].push(pm.id_peran);
    }

    for (const item of rawData) {
      item.id_peran = peranMap[item.id_menu] || [];
    }

    // Flatten hierarchical tree to array
    const buildFlatTree = (parentId = null) => {
      let oResult = [];
      const children = rawData.filter(item => item.id_menu_induk === parentId);
      for (const child of children) {
        oResult.push(child);
        oResult = oResult.concat(buildFlatTree(child.id));
      }
      return oResult;
    };
    let vaData = buildFlatTree(null);

    // Antisipasi menu yatim (jika parent di-soft-delete tapi anak masih ada)
    const handledIds = new Set(vaData.map(d => d.id));
    const orphans = rawData.filter(d => !handledIds.has(d.id));
    if (orphans.length > 0) {
      vaData = vaData.concat(orphans);
    }

    return res.status(200).json({
      status: "SUKSES",
      data: vaData
    });
  } catch (error) {
    const oResult = {
      status: "GAGAL",
      error: error.message
    };
    Logging(error, {
      file: "menu_data.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;
