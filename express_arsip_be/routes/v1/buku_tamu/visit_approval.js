import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const nama_pengguna = req?.auth?.nama_pengguna || "";
  const userperan = req?.auth?.peran || "";

  try {
    const { idKunjungan, action, catatanPersetujuan } = oPayload;

    if (!idKunjungan || !action) {
      return res.status(400).json({
        status: "99",
        message: "idKunjungan dan action wajib diisi",
        datetime: formatDateSystem(),
      });
    }

    if (
      ![
        "master",
        "admin",
        "pimpinan",
        "superadmin",
        "administrator",
        "resepsionis",
      ].includes(userperan?.toLowerCase())
    ) {
      return res.status(403).json({
        status: "99",
        message: "Akses ditolak",
        datetime: formatDateSystem(),
      });
    }

    if (!["approved", "rejected"].includes(action)) {
      return res.status(400).json({
        status: "99",
        message: "Action tidak valid",
        datetime: formatDateSystem(),
      });
    }

    await DB("trs_kunjungan")
      .where("id_kunjungan", idKunjungan)
      .update({
        status_persetujuan: action,
        catatan_persetujuan: catatanPersetujuan,
        updated_at: formatDateSystem(),
      });

    return res.status(200).json({
      status: "00",
      message: "Proses persetujuan berhasil",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    Logging(error, {
      file: "visit_approval.js",
      func: "approval",
      request: req.body,
      response: "error",
      user: nama_pengguna,
    });
    return res.status(500).json({
      status: "01",
      message: "Sistem error",
      datetime: formatDateSystem(),
    });
  }
});

export default router;
