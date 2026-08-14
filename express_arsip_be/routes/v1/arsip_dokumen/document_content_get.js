import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

/**
 * Endpoint to retrieve extracted text content for a document or specific version
 */
const getDocumentContent = async (req, res) => {
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

    let query = DB("trx_konten_dokumen as k")
      .select(
        "k.id_konten",
        "k.kode_dokumen",
        "k.id_versi",
        "k.konten_teks",
        "k.sumber_konten",
        "k.status_ocr",
        "k.pesan_error",
        "k.jumlah_halaman",
        "k.bahasa_ocr",
        "k.created_at",
        "k.updated_at",
        "v.nomor_versi",
        "v.file_path"
      )
      .leftJoin("trx_versi_dokumen as v", "k.id_versi", "v.id_versi")
      .where("k.kode_dokumen", cKodeDokumen);

    if (nIdVersi) {
      query = query.where("k.id_versi", nIdVersi);
    } else {
      query = query.orderBy("v.nomor_versi", "desc");
    }

    const oData = await query.first();

    if (!oData) {
      return res.status(404).json({
        status: "error",
        message: "Konten teks / OCR dokumen belum tersedia",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Konten dokumen berhasil diambil",
      data: oData,
    });
  } catch (error) {
    Logging(error, {
      file: "document_content_get.js",
      func: "getDocumentContent",
      request: oQuery,
    });
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil konten dokumen",
      error: error.message,
    });
  }
};

export default getDocumentContent;
