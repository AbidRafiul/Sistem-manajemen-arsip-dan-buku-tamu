import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { getPresignedUrlFromMinio } from "../../../core/components/tools/minio_helper.js";
import { applyMultiTenantFilter } from "../components/tools/filterHelper.js";
import { getDescendantBranchIds } from "../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  try {
    const page = parseInt(oPayload.page || 1, 10) || 1;
    const limit = parseInt(oPayload.limit || 20, 10) || 20;
    const offset = (page - 1) * limit;

    const q = DB("trs_kunjungan as t")
      .select(
        "t.*",
        "mp.nama_tujuan_kunjungan as VisitPurposeName",
        "u.nama_lengkap as HostFullname",
        "c.nama_cabang as BranchName"
      )
      .leftJoin("mst_tujuan_kunjungan as mp", "t.id_tujuan_kunjungan", "mp.id_tujuan_kunjungan")
      .leftJoin("mst_pengguna as u", "t.id_user_host", "u.id_pengguna")
      .leftJoin("mst_cabang as c", "u.id_cabang", "c.id_cabang");

    const qCount = DB("trs_kunjungan as t")
      .leftJoin("mst_pengguna as u", "t.id_user_host", "u.id_pengguna")
      .count({ total: '*' });

    // Multi-tenancy: isolasi data berdasarkan cabang host
    applyMultiTenantFilter(q, req, 'u');
    applyMultiTenantFilter(qCount, req, 'u');

    // Filter berdasarkan cabang (Isolasi Cabang / Hirarki Perusahaan)
    if (req.auth?.peranCode !== "SUPERADMIN") {
      const userBranchId = req.auth?.id_cabang || 1;
      const branchIds = await getDescendantBranchIds(DB, userBranchId);
      q.whereIn("u.id_cabang", branchIds);
      qCount.whereIn("u.id_cabang", branchIds);
    } else if (oPayload.BranchId || oPayload.id_cabang) {
      const filterBranchId = oPayload.BranchId || oPayload.id_cabang;
      const branchIds = await getDescendantBranchIds(DB, filterBranchId);
      q.whereIn("u.id_cabang", branchIds);
      qCount.whereIn("u.id_cabang", branchIds);
    }

    if (oPayload.Status) {
      q.where("t.status", oPayload.Status);
      qCount.where("t.status", oPayload.Status);
    }
    if (oPayload.ApprovalStatus) {
      q.where("t.status_persetujuan", oPayload.ApprovalStatus);
      qCount.where("t.status_persetujuan", oPayload.ApprovalStatus);
    }
    if (oPayload.GuestName) {
      q.where("t.nama_tamu", "like", `%${oPayload.GuestName}%`);
      qCount.where("t.nama_tamu", "like", `%${oPayload.GuestName}%`);
    }
    if (oPayload.VisitPurposeId) {
      q.where("t.id_tujuan_kunjungan", oPayload.VisitPurposeId);
      qCount.where("t.id_tujuan_kunjungan", oPayload.VisitPurposeId);
    }

    if (oPayload.TanggalMulai && oPayload.TanggalSelesai) {
      const start = oPayload.TanggalMulai + " 00:00:00";
      const end = oPayload.TanggalSelesai + " 23:59:59";
      q.whereBetween("t.created_at", [start, end]);
      qCount.whereBetween("t.created_at", [start, end]);
    }

    const totalObj = await qCount.first();
    const rows = await q.orderBy("t.created_at", "desc").limit(limit).offset(offset);

    for (const r of rows) {
      if (r.foto_wajah) {
        r.PhotoFaceUrl = r.foto_wajah.startsWith('http') ? r.foto_wajah : await getPresignedUrlFromMinio("buku-tamu", r.foto_wajah);
      } else {
        r.PhotoFaceUrl = null;
      }

      if (r.foto_identitas) {
        r.PhotoIdentityUrl = r.foto_identitas.startsWith('http') ? r.foto_identitas : await getPresignedUrlFromMinio("buku-tamu", r.foto_identitas);
      } else {
        r.PhotoIdentityUrl = null;
      }
      if (r.tanda_tangan) {
        r.SignatureUrl = r.tanda_tangan.startsWith('http') ? r.tanda_tangan : await getPresignedUrlFromMinio("buku-tamu", r.tanda_tangan);
      } else {
        r.SignatureUrl = null;
      }
    }

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: { total: totalObj?.total || 0, page, limit, rows },
      datetime: formatDateSystem(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "01",
      message: "Sistem error",
      datetime: formatDateSystem(),
    });
  }
});

router.post("/purposes", async (req, res) => {
  try {
    const listTujuan = await DB("mst_tujuan_kunjungan")
      .select("id_tujuan_kunjungan as id", "nama_tujuan_kunjungan as name");

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: listTujuan,
      datetime: formatDateSystem()
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Gagal memuat list tujuan", datetime: formatDateSystem() });
  }
});

router.post("/branches", async (req, res) => {
  try {
    const listCabang = await DB("mst_cabang")
      .select("id_cabang as id", "nama_cabang as name", "id_induk")
      .whereNot("status", "deleted");

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: listCabang,
      datetime: formatDateSystem()
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Gagal memuat list cabang", datetime: formatDateSystem() });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { id_cabang } = req.body;
    let query = DB("mst_pengguna as u")
      .select("u.id_pengguna as id", "u.nama_lengkap as name", "u.id_cabang")
      .where("u.status", "active");

    if (id_cabang && id_cabang !== "null" && id_cabang !== "undefined") {
      const branchIds = await getDescendantBranchIds(DB, id_cabang);
      query = query.whereIn("u.id_cabang", branchIds);
    }

    const listUser = await query.orderBy("u.nama_lengkap", "asc");

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: listUser,
      datetime: formatDateSystem()
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Gagal memuat list pegawai", datetime: formatDateSystem() });
  }
});

export default router;
