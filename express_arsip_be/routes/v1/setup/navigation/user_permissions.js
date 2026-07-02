import express from "express";
import DB from "../../../../core/config/knex.js";
import { status } from "../../components/tools/general.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { nama_pengguna } = req.body;

    if (!nama_pengguna) {
      return res
        .status(400)
        .json({ message: "Parameter nama_pengguna dibutuhkan" });
    }

    const user = await DB("mst_pengguna as mu")
      .leftJoin(
        "mst_pengguna_peran as mur",
        "mu.id_pengguna",
        "mur.id_pengguna",
      )
      .where("mu.nama_pengguna", nama_pengguna)
      .select("mur.id_peran")
      .orderBy("mur.peran_utama", "desc")
      .first();

    if (!user?.id_peran) {
      return res.status(200).json({
        status: status.SUKSES,
        message: "User tidak memiliki peran",
        data: {},
      });
    }

    const rawPermissions = await DB("mst_menu as m")
      .join(
        "mst_peran_menu as pm",
        "m.id_menu",
        "pm.id_menu",
      )
      .where("pm.id_peran", user.id_peran)
      .where("m.status_aktif", 1)
      .select(
        "m.jalur_menu",
        "pm.hak_lihat",
        "pm.hak_buat",
        "pm.hak_ubah",
        "pm.hak_hapus",
        "pm.hak_setuju",
      );
    const permissionsMap = {};

    for (const row of rawPermissions) {
      if (row.jalur_menu) {
        permissionsMap[row.jalur_menu] = {
          canView: Boolean(row.hak_lihat),
          canCreate: Boolean(row.hak_buat),
          canUpdate: Boolean(row.hak_ubah),
          canDelete: Boolean(row.hak_hapus),
          canApprove: Boolean(row.hak_setuju),
        };
      }
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Hak akses berhasil diambil",
      data: permissionsMap,
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return res.status(500).json({ message: "Terjadi kesalahan internal" });
  }
});

export default router;
