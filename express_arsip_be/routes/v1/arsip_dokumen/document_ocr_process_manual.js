import DB from "../../../core/config/knex.js";
import { processDocumentContent } from "../../../core/components/ocr_service.js";
import { Logging } from "../components/tools/servertool.js";

/**
 * Trigger manual OCR process
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

    const oVersion = await DB("trx_versi_dokumen")
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
      file: "document_ocr_process_manual.js",
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
