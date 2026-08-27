import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging } from "../components/tools/servertool.js";
const router = express.Router();
router.post("/", async (req, res) => {
  const {
    VisitCode
  } = req.body;
  if (!VisitCode) {
    return res.status(400).json({
      status: "99",
      message: "Kode kunjungan (VisitCode) wajib diisi",
      datetime: formatDateSystem()
    });
  }
  try {
    const oRow = await DB("trx_kunjungan as t").select("t.nama_tamu", "t.nomor_telepon", "t.instansi_tamu", "t.waktu_masuk", "t.waktu_keluar", "t.status", "t.status_persetujuan", "t.catatan_kunjungan", "t.nama_host", "t.token_qr", "t.kode_kunjungan", "mp.nama_tujuan_kunjungan as VisitPurposeName", "t.created_at").leftJoin("mst_tujuan_kunjungan as mp", "t.id_tujuan_kunjungan", "mp.id_tujuan_kunjungan").where("t.kode_kunjungan", VisitCode).first();
    if (!oRow) {
      return res.status(404).json({
        status: "03",
        message: "Kode kunjungan tidak ditemukan",
        datetime: formatDateSystem()
      });
    }
    const cBaseUrl = process.env.APP_SERVER || `http://localhost:${process.env.APP_PORT || '8000'}`;
    const cQrImageUrl = oRow.token_qr ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${oRow.token_qr}` : null;
    return res.status(200).json({
      status: "00",
      message: "OK",
      data: {
        ...oRow,
        qr_image_url: cQrImageUrl
      },
      datetime: formatDateSystem()
    });
  } catch (error) {
    const oResult = {
      status: "01",
      message: "Sistem error saat memuat status booking",
      datetime: formatDateSystem()
    };
    Logging(error, {
      file: "visit_booking_status.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;
