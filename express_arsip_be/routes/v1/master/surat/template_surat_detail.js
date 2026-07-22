import express from "express";
import DB from "../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";

const router = express.Router();

const getTemplateSuratById = async (req, res) => {
  const { id } = req.params;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const data = await DB("mst_template_surat as mts")
      .leftJoin("mst_jenis_surat as mjs", "mjs.jenis_surat_id", "mts.jenis_surat_id")
      .select(
        "mts.id_template",
        "mts.kode_template",
        "mts.nama_template",
        "mts.jenis_surat_id",
        "mjs.nama_jenis_surat",
        "mts.deskripsi",
        "mts.isi_template",
        "mts.status",
        "mts.created_by",
        "mts.updated_by",
        "mts.created_at",
        "mts.updated_at"
      )
      .where("mts.id", Number(id))
      .first();

    if (!data) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Template surat tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Detail template surat berhasil ditarik",
      datetime: formatDateSystem(),
      data,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    await Logging(error, {
      file: "template_surat_detail.js",
      func: "getTemplateSuratById",
      request: { id },
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
};

router.get("/:id", getTemplateSuratById);

export default router;
