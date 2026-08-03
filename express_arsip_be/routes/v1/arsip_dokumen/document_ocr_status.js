import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

/**
 * Check OCR status
 */
export const getOcrStatus = async (req, res) => {
  const oQuery = req.query;
  try {
    const cKodeDokumen = oQuery.kode_dokumen || oQuery.document_code;
    const nIdVersi = oQuery.id_versi || oQuery.version_id;

    if (!cKodeDokumen) {
      return res.status(422).json({
        status: "error",
        message: "kode_dokumen wajib diisi",
      });
    }

    let query = DB("trs_konten_dokumen").where("kode_dokumen", cKodeDokumen);
    if (nIdVersi) {
      query = query.where("id_versi", nIdVersi);
    }

    const vaData = await query.orderBy("id_konten", "desc");

    return res.status(200).json({
      status: "success",
      message: "Status OCR berhasil diambil",
      data: vaData,
    });
  } catch (error) {
    Logging(error, {
      file: "document_ocr_status.js",
      func: "getOcrStatus",
      request: oQuery,
    });
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil status OCR",
      error: error.message,
    });
  }
};
