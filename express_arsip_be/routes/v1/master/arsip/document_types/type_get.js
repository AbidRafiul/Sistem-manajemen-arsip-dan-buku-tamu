import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

const getDocumentType = async (req, res) => {
  const oPayload = req.body;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const vaData = await DB("mst_jenis_dokumen")
      .select(
        "id_jenis_dokumen",
        "kode_jenis_dokumen",
        "nama_jenis_dokumen",
        "deskripsi",
        "status"

      )
      .where("status", "active")
      .orderBy("created_at", "desc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data jenis dokumen berhasil ditarik",
      datetime: formatDateSystem(),
      data: vaData,
      total_data: vaData.length,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    Logging(error, {
      file: "type_get.js",
      func: "getDocumentType",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
};

router.get("/", getDocumentType);

export default router;
