import express from "express";
import DB from "../../../../core/config/knex.js";
import fs from "fs";
import path from "path";
import { status } from "../../components/tools/general.js";
import { Logging } from "../tools/servertool.js";
const router = express.Router();
router.post("/", async (req, res) => {
  const {
    Key
  } = req.body;
  if (!Key) return res.status(400).json({
    status: status.GAGAL,
    message: "Key wajib diisi"
  });
  try {
    const config = await DB("config").where("kode", Key).select("keterangan").first();
    if (!config) {
      return res.json({
        status: status.SUKSES,
        data: ""
      });
    }
    let keterangan = config.keterangan;
    if (Key === "msLogoPerusahaan" && keterangan) {
      // Convert to base64
      const filePath = path.join(process.cwd(), "public", "uploads", "config", "logo_perusahaan", keterangan);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(keterangan).substring(1).toLowerCase(); // e.g. png, jpg, jpeg
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
        const fileData = fs.readFileSync(filePath);
        const base64 = `data:${mimeType};base64,${fileData.toString('base64')}`;
        keterangan = base64;
      } else {
        keterangan = "";
      }
    }
    return res.json({
      status: status.SUKSES,
      data: keterangan,
      message: "Berhasil mengambil konfigurasi"
    });
  } catch (err) {
    const oResult = {
      status: status.GAGAL,
      message: err.message
    };
    Logging(err, {
      file: "db_config.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;
