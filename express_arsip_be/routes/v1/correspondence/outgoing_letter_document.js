import express from "express";
import DB from "../../../core/config/knex.js";
import { buildDocxBufferFromText } from "../components/tools/docx_builder.js";
import { Logging } from "../components/tools/servertool.js";
const router = express.Router();
router.get("/:id_surat_keluar", async (req, res) => {
  try {
    const surat = await DB("trs_surat_keluar as tsk").leftJoin("mst_jenis_surat as mjs", "tsk.id_jenis_surat", "mjs.jenis_surat_id").leftJoin("mst_template_surat as mts", "tsk.id_template", "mts.id_template").select("tsk.id_surat_keluar", "tsk.nomor_surat", "tsk.nomor_agenda", "tsk.tanggal_surat", "tsk.perihal", "tsk.tujuan", "tsk.instansi_tujuan", "tsk.media_pengiriman", "tsk.isi_surat_final", "tsk.nama_pengirim", "tsk.jabatan", "mts.nama_template", "mjs.nama_jenis_surat").where("tsk.id_surat_keluar", req.params.id_surat_keluar).first();
    if (!surat) {
      return res.status(404).json({
        status: false,
        message: "Surat keluar tidak ditemukan"
      });
    }
    const bodyText = surat.isi_surat_final || [`Nomor: ${surat.nomor_surat || "-"}`, `Perihal: ${surat.perihal || "-"}`, `Jenis Surat: ${surat.nama_jenis_surat || "-"}`, "", `Tujuan: ${surat.tujuan || "-"}`, surat.instansi_tujuan || ""].join("\n");
    const buffer = await buildDocxBufferFromText(`${surat.nomor_surat || "surat-keluar"}`, bodyText, surat);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${String(surat.nomor_surat || "surat-keluar").replace(/[^\w.-]+/g, "_")}.docx"`);
    return res.status(200).send(buffer);
  } catch (error) {
    const oResult = {
      status: false,
      message: "Dokumen surat keluar gagal dibuat"
    };
    Logging(error, {
      file: "outgoing_letter_document.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;