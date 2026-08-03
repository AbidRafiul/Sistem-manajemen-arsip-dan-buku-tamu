import express from "express";
import DB from "../../../../core/config/knex.js";

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
        "status_aktif as status_aktif",
      )
      .where("status_aktif", 1)
      .orderBy("urutan", "asc");

    // Flatten hierarchical tree to array
    const buildFlatTree = (parentId = null) => {
      let result = [];
      const children = rawData.filter((item) => item.id_menu_induk === parentId);
      for (const child of children) {
        result.push(child);
        result = result.concat(buildFlatTree(child.id));
      }
      return result;
    };

    const data = buildFlatTree(null);

    return res.status(200).json({ status: "SUKSES", data });
  } catch (error) {
    return res.status(500).json({ status: "GAGAL", error: error.message });
  }
});

export default router;
