import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentVersions = async (req, res) => {
  const oQuery = req.query;

  try {
    const cKodeDokumen = oQuery.kode_dokumen || oQuery.document_code;
    const nIdDokumen = oQuery.id_dokumen || oQuery.document_id;

    if (!cKodeDokumen && !nIdDokumen) {
      const oResult = {
        status: "error",
        message: "kode_dokumen atau id_dokumen wajib diisi",
      };

      return res.status(422).json(oResult);
    }

    let oDocument;
    if (cKodeDokumen) {
      oDocument = await DB("trs_dokumen")
        .select("id_dokumen", "kode_dokumen")
        .where("kode_dokumen", cKodeDokumen)
        .where("status", "active")
        .first();
    } else {
      oDocument = await DB("trs_dokumen")
        .select("id_dokumen", "kode_dokumen")
        .where("id_dokumen", nIdDokumen)
        .where("status", "active")
        .first();
    }

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found",
      };

      return res.status(404).json(oResult);
    }

    const vaData = await DB("trs_versi_dokumen")
      .select(
        "id_versi",
        "kode_dokumen",
        "nomor_versi",
        "catatan_perubahan",
        "file_path",
        "status_persetujuan",
        "diunggah_oleh",
        "disetujui_oleh",
        "disetujui_pada",
        "catatan_persetujuan",
        "created_at",
        "updated_at",
      )
      .where("kode_dokumen", oDocument.kode_dokumen)
      .orderBy("nomor_versi", "desc");

    const oResult = {
      status: "success",
      message: "Document versions retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve document versions",
      error: error.message,
    };

    Logging(error, {
      file: "document_version_get.js",
      func: "getDocumentVersions",
      request: oQuery,
      response: oResult,
      user: req?.auth?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocumentVersions;
