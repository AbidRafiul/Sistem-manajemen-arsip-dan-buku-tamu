import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { VisitCode } = req.body;

  if (!VisitCode) {
    return res.status(400).json({
      status: "99",
      message: "Kode kunjungan (VisitCode) wajib diisi",
      datetime: formatDateSystem()
    });
  }

  try {
    const row = await DB("trs_kunjungan as t")
      .select(
        "t.nama_tamu",
        "t.nomor_telepon",
        "t.instansi_tamu",
        "t.waktu_masuk",
        "t.waktu_keluar",
        "t.status",
        "t.status_persetujuan",
        "t.catatan_kunjungan",
        "t.nama_host",
        "t.token_qr",
        "t.kode_kunjungan",
        "mp.nama_tujuan_kunjungan as VisitPurposeName",
        "t.created_at"
      )
      .leftJoin("mst_tujuan_kunjungan as mp", "t.id_tujuan_kunjungan", "mp.id_tujuan_kunjungan")
      .where("t.kode_kunjungan", VisitCode)
      .first();

    if (!row) {
      return res.status(404).json({
        status: "03",
        message: "Kode kunjungan tidak ditemukan",
        datetime: formatDateSystem()
      });
    }

    const cBaseUrl = `${process.env.APP_SERVER || 'http://localhost'}:${process.env.APP_PORT || '8000'}`;
    const qr_image_url = row.token_qr ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${row.token_qr}` : null;

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: {
        ...row,
        qr_image_url
      },
      datetime: formatDateSystem()
    });

  } catch (error) {
    console.error("Error checking visit booking status:", error);
    return res.status(500).json({
      status: "01",
      message: "Sistem error saat memuat status booking",
      datetime: formatDateSystem()
    });
  }
});

export default router;
