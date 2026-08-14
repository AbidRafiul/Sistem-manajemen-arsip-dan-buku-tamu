import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging } from "../components/tools/servertool.js";
const router = express.Router();
router.post("/", async (req, res) => {
  const {
    QRToken
  } = req.body;
  if (!QRToken) return res.status(400).json({
    status: "99",
    message: "QRToken wajib",
    datetime: formatDateSystem()
  });
  try {
    const cleanToken = String(QRToken).trim();
    const oRecord = await DB("trx_kunjungan").where("token_qr", cleanToken).orWhere("kode_kunjungan", cleanToken).orWhere("id_kunjungan", cleanToken).first();
    if (!oRecord) return res.status(404).json({
      status: "03",
      message: "Tamu tidak ditemukan",
      datetime: formatDateSystem()
    });
    const canCheckout = oRecord.status === "in";
    return res.status(200).json({
      status: "00",
      message: "OK",
      data: {
        record: oRecord,
        canCheckout
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
      file: "visit_qr_scan.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;