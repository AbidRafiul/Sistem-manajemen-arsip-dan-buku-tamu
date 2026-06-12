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
    const nDocumentId = parseInt(oPayload.DocumentId, 10);
    const cChangeNotes = oPayload.ChangeNotes || null;
    const cUploadedBy = req?.context?.Username || oPayload.UploadedBy || "system";
    const dNow = new Date();

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "DocumentId wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Verifikasi dokumen aktif
    const oDocument = await DB("trx_documents")
      .where("DocumentId", nDocumentId)
      .where("Status", "active")
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
      .select("VersionNumber")
      .where("DocumentId", nDocumentId)
      .orderBy("VersionNumber", "desc")
      .first();

    const nVersionNumber = oLastVersion ? oLastVersion.VersionNumber + 1 : 1;

    const oData = {
      DocumentId: nDocumentId,
      VersionNumber: nVersionNumber,
      ChangeNotes: cChangeNotes,
      FilePath: cFilePath,
      UploadedBy: cUploadedBy,
      ApprovalStatus: "pending",
      ApprovedBy: null,
      ApprovedAt: null,
      ApprovalNotes: null,
      CreatedAt: dNow,
      UpdatedAt: dNow,
    };

    const [nVersionId] = await DB("trx_document_versions").insert(oData);

    const oResult = {
      status: "success",
      message: `Versi dokumen V${nVersionNumber} berhasil diunggah dan menunggu approval`,
      data: {
        VersionId: nVersionId,
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
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default uploadDocumentVersion;
