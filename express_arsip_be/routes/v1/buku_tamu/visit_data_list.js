import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { getPresignedUrlFromMinio } from "../../../core/components/tools/minio_helper.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";
import { getDescendantBranchIds, Logging } from "../components/tools/servertool.js";
const router = express.Router();
router.post("/", async (req, res) => {
  const {
    body: oPayload
  } = req;
  try {
    const page = parseInt(oPayload.page || 1, 10) || 1;
    const limit = parseInt(oPayload.limit || 20, 10) || 20;
    const offset = (page - 1) * limit;
    const q = DB("trx_kunjungan as t").select("t.*", "mp.nama_tujuan_kunjungan as VisitPurposeName", "u.nama_lengkap as HostFullname", "c.nama_cabang as BranchName").leftJoin("mst_tujuan_kunjungan as mp", "t.id_tujuan_kunjungan", "mp.id_tujuan_kunjungan").leftJoin("mst_pengguna as u", "t.id_user_host", "u.id_pengguna").leftJoin("mst_cabang as c", "u.id_cabang", "c.id_cabang");
    const qCount = DB("trx_kunjungan as t").leftJoin("mst_pengguna as u", "t.id_user_host", "u.id_pengguna").count({
      total: '*'
    });

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
    } else if (req.headers["x-filter-cabang"]) {
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
        q.whereIn("u.id_cabang", vaAllBranchIds);
        qCount.whereIn("u.id_cabang", vaAllBranchIds);
      }
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
        r.PhotoFaceUrl = r.foto_wajah.startsWith('http') ? r.foto_wajah : await getPresignedUrlFromMinio("arsip-bucket", r.foto_wajah);
      } else {
        r.PhotoFaceUrl = null;
      }
      if (r.foto_identitas) {
        r.PhotoIdentityUrl = r.foto_identitas.startsWith('http') ? r.foto_identitas : await getPresignedUrlFromMinio("arsip-bucket", r.foto_identitas);
      } else {
        r.PhotoIdentityUrl = null;
      }
      if (r.tanda_tangan) {
        r.SignatureUrl = r.tanda_tangan.startsWith('http') ? r.tanda_tangan : await getPresignedUrlFromMinio("arsip-bucket", r.tanda_tangan);
      } else {
        r.SignatureUrl = null;
      }
    }
    return res.status(200).json({
      status: "00",
      message: "OK",
      data: {
        total: totalObj?.total || 0,
        page,
        limit,
        rows
      },
      datetime: formatDateSystem()
    });
  } catch (error) {
    const oResult = {
      status: "01",
      message: "Sistem error",
      datetime: formatDateSystem()
    };
    Logging(error, {
      file: "visit_data_list.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;