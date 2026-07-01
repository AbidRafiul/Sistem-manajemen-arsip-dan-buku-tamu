import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";

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
        "u.fullname as HostFullname"
      )
      .leftJoin("mst_tujuan_kunjungan as mp", "t.id_tujuan_kunjungan", "mp.id_tujuan_kunjungan")
      .leftJoin("mst_pengguna as u", "t.id_user_host", "u.user_id");

    const qCount = DB("trs_kunjungan as t").count({ total: '*' });

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

    const cBaseUrl = `${process.env.APP_SERVER || "http://localhost"}:${process.env.APP_PORT || "8000"}`;
    for (const r of rows) {
      if (r.foto_wajah) {
        r.PhotoFaceUrl = r.foto_wajah.startsWith('http') ? r.foto_wajah : `${cBaseUrl}/uploads/${r.foto_wajah}`;
      } else {
        r.PhotoFaceUrl = null;
      }

      if (r.foto_identitas) {
        r.PhotoIdentityUrl = r.foto_identitas.startsWith('http') ? r.foto_identitas : `${cBaseUrl}/uploads/${r.foto_identitas}`;
      } else {
        r.PhotoIdentityUrl = null;
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

export default router;
