import express from "express";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem, datetime } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

function buildTree(menus, peranMenus, parentId = null) {
  const tree = [];
  const children = menus.filter(m => m.id_menu_induk === parentId);
  
  for (const child of children) {
    const roleMenu = peranMenus.find(pm => pm.id_menu === child.id_menu) || {};
    
    const node = {
      key: child.id_menu.toString(),
      data: {
        id_menu: child.id_menu,
        nama_menu: child.nama_menu,
        hak_lihat: !!roleMenu.hak_lihat,
        hak_buat: !!roleMenu.hak_buat,
        hak_ubah: !!roleMenu.hak_ubah,
        hak_hapus: !!roleMenu.hak_hapus,
        hak_setuju: !!roleMenu.hak_setuju
      },
      children: buildTree(menus, peranMenus, child.id_menu)
    };
    
    tree.push(node);
  }
  
  return tree;
}

router.post("/get", async (req, res) => {
  const { id_peran } = req.body;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    if (!id_peran) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: "ID Peran diperlukan", datetime: formatDateSystem() });
    }

    // Ambil semua menu aktif
    const menus = await DB("mst_menu").where("status_aktif", 1).orderBy("urutan", "asc");
    
    // Ambil permissions untuk peran ini
    const peranMenus = await DB("mst_peran_menu").where("id_peran", id_peran);

    // Bangun tree structure
    const treeData = buildTree(menus, peranMenus, null);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data permissions berhasil ditarik",
      datetime: formatDateSystem(),
      data: treeData,
    });
  } catch (error) {
    Logging(error, { file: "roles_permissions.js", func: "get", request: req.body, user: cnama_pengguna });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Terjadi kesalahan sistem", datetime: formatDateSystem() });
  }
});

router.post("/update", async (req, res) => {
  const { id_peran, permissions } = req.body;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    if (!id_peran || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: "Payload tidak valid", datetime: formatDateSystem() });
    }

    // Kita akan hapus semua permission lama untuk peran ini
    await DB("mst_peran_menu").where("id_peran", id_peran).del();

    // Siapkan data insert baru
    const insertData = [];
    const dNow = new Date();

    for (const p of permissions) {
      // Hanya insert jika setidaknya ada 1 hak akses, atau insert semua?
      // Sebaiknya insert semua yang dikirim dari UI, asalkan id_menu ada.
      if (p.id_menu && (p.hak_lihat || p.hak_buat || p.hak_ubah || p.hak_hapus || p.hak_setuju)) {
        insertData.push({
          id_peran: id_peran,
          id_menu: p.id_menu,
          hak_lihat: p.hak_lihat ? 1 : 0,
          hak_buat: p.hak_buat ? 1 : 0,
          hak_ubah: p.hak_ubah ? 1 : 0,
          hak_hapus: p.hak_hapus ? 1 : 0,
          hak_setuju: p.hak_setuju ? 1 : 0,
          created_at: dNow,
          updated_at: dNow
        });
      }
    }

    if (insertData.length > 0) {
      // Batch insert
      await DB("mst_peran_menu").insert(insertData);
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Hak akses berhasil diperbarui",
      datetime: formatDateSystem()
    });
  } catch (error) {
    console.error(error);
    Logging(error, { file: "roles_permissions.js", func: "update", request: req.body, user: cnama_pengguna });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Gagal menyimpan hak akses", datetime: formatDateSystem() });
  }
});

export default router;
