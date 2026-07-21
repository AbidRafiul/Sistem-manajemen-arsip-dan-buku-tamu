import DB from "../../../core/config/knex.js";
import { processDocumentContent } from "../../../core/components/ocr_service.js";
import { Logging } from "../components/tools/servertool.js";

/**
 * Trigger manual OCR process or check OCR status
 */
export const processOcrManual = async (req, res) => {
  const oPayload = req.body;
  try {
    const cKodeDokumen = oPayload.kode_dokumen || oPayload.document_code;
    const nIdVersi = oPayload.id_versi || oPayload.version_id;
    const cLang = oPayload.bahasa || oPayload.lang || "eng";

    if (!cKodeDokumen || !nIdVersi) {
      return res.status(422).json({
        status: "error",
        message: "kode_dokumen dan id_versi wajib diisi",
      });
    }

    const oVersion = await DB("trs_versi_dokumen")
      .where("id_versi", nIdVersi)
      .where("kode_dokumen", cKodeDokumen)
      .first();

    if (!oVersion) {
      return res.status(404).json({
        status: "error",
        message: "Versi dokumen tidak ditemukan",
      });
    }

    // Trigger process in background (non-blocking) or synchronous response
    processDocumentContent(cKodeDokumen, nIdVersi, oVersion.file_path, cLang).catch(
      (err) => console.error("[OCR Manual Error]:", err.message)
    );

    return res.status(200).json({
      status: "success",
      message: "Proses OCR / ekstraksi teks dokumen telah dimulai di latar belakang",
      data: {
        kode_dokumen: cKodeDokumen,
        id_versi: nIdVersi,
        status_ocr: "processing",
      },
    });
  } catch (error) {
    Logging(error, {
      file: "document_ocr_process.js",
      func: "processOcrManual",
      request: oPayload,
    });
    return res.status(500).json({
      status: "error",
      message: "Gagal memulai proses OCR",
      error: error.message,
    });
  }
};

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
      file: "document_ocr_process.js",
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
