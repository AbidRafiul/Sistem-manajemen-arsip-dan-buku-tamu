import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { QRToken } = req.body;
  if (!QRToken) return res.status(400).json({ status: "99", message: "QRToken wajib", datetime: formatDateSystem() });

  try {
    const record = await DB("trx_visitations").where("QRToken", QRToken).first();
    if (!record) return res.status(404).json({ status: "03", message: "Tamu tidak ditemukan", datetime: formatDateSystem() });

    const canCheckout = record.Status === "in";
    return res.status(200).json({ status: "00", message: "OK", data: { record, canCheckout }, datetime: formatDateSystem() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Sistem error", datetime: formatDateSystem() });
  }
});

export default router;
