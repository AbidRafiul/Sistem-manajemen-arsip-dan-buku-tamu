import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const uploadDocumentVersion = async (req, res) => {
  const oPayload = req.body;

  try {
    const oFile = req.file;

    if (!oFile) {
      const oResult = {
        status: "error",
        message: "File dokumen wajib diunggah",
      };
      return res.status(400).json(oResult);
    }

    const cFilePath = `/uploads/documents/${oFile.filename}`;
    const nDocumentId = parseInt(oPayload.document_id, 10);
    const cChangeNotes = oPayload.change_notes || null;
    const cUploadedBy =
      req?.context?.nama_pengguna || oPayload.uploaded_by || "system";
    const dNow = new Date();

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "document_id wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Verifikasi dokumen aktif
    const oDocument = await DB("trx_documents")
      .where("document_id", nDocumentId)
      .where("status", "active")
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found or already inactive",
      };
      return res.status(404).json(oResult);
    }

    // Hitung nomor versi berikutnya
    const oLastVersion = await DB("trx_document_versions")
      .select("version_number")
      .where("document_id", nDocumentId)
      .orderBy("version_number", "desc")
      .first();

    const nVersionNumber = oLastVersion ? oLastVersion.version_number + 1 : 1;

    const oData = {
      document_id: nDocumentId,
      version_number: nVersionNumber,
      change_notes: cChangeNotes,
      file_path: cFilePath,
      uploaded_by: cUploadedBy,
      approval_status: "pending",
      approved_by: null,
      approved_at: null,
      approval_notes: null,
      created_at: dNow,
      updated_at: dNow,
    };

    const [nVersionId] = await DB("trx_document_versions").insert(oData);

    const oResult = {
      status: "success",
      message: `Versi dokumen V${nVersionNumber} berhasil diunggah dan menunggu approval`,
      data: {
        version_id: nVersionId,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Gagal mengunggah versi dokumen",
      error: error.message,
    };

    Logging(error, {
      file: "document_version_upload.js",
      func: "uploadDocumentVersion",
      request: oPayload,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default uploadDocumentVersion;
