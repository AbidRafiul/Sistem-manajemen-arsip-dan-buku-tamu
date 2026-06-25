import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const rollbackDocumentVersion = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.document_id;
    const nTargetVersionId = oPayload.version_id;
    const cUploadedBy =
      req?.context?.nama_pengguna || oPayload.rollback_by || "system";
    const dNow = new Date();

    if (!nDocumentId || !nTargetVersionId) {
      const oResult = {
        status: "error",
        message: "document_id dan version_id (target rollback) wajib diisi",
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

    // Ambil versi target yang akan di-rollback
    const oTargetVersion = await DB("trx_document_versions")
      .where("version_id", nTargetVersionId)
      .where("document_id", nDocumentId)
      .where("approval_status", "approved")
      .first();

    if (!oTargetVersion) {
      const oResult = {
        status: "error",
        message:
          "Target version not found, not approved, or not belonging to this document",
      };
      return res.status(404).json(oResult);
    }

    // Ambil nomor versi terbaru untuk menentukan nomor versi baru
    const oLastVersion = await DB("trx_document_versions")
      .select("version_number")
      .where("document_id", nDocumentId)
      .orderBy("version_number", "desc")
      .first();

    const nNewVersionNumber = oLastVersion
      ? oLastVersion.version_number + 1
      : 1;

    // Buat versi baru dengan FilePath dari versi target (rollback)
    const oNewVersion = {
      document_id: nDocumentId,
      version_number: nNewVersionNumber,
      change_notes: `Rollback ke V${oTargetVersion.version_number} (VersionId: ${nTargetVersionId})`,
      file_path: oTargetVersion.file_path,
      uploaded_by: cUploadedBy,
      // Rollback langsung approved (by system/user yang melakukan rollback)
      approval_status: "approved",
      approved_by: cUploadedBy,
      approved_at: dNow,
      approval_notes: `Auto-approved: rollback ke versi ${oTargetVersion.version_number}`,
      created_at: dNow,
      updated_at: dNow,
    };

    const [nNewVersionId] = await DB("trx_document_versions").insert(
      oNewVersion,
    );

    const oResult = {
      status: "success",
      message: `Dokumen berhasil di-rollback ke V${oTargetVersion.version_number}. Versi baru V${nNewVersionNumber} dibuat.`,
      data: {
        version_id: nNewVersionId,
        rolled_back_from_version_id: nTargetVersionId,
        rolled_back_from_version_number: oTargetVersion.version_number,
        new_version_number: nNewVersionNumber,
        ...oNewVersion,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to rollback document version",
      error: error.message,
    };

    Logging(error, {
      file: "document_version_rollback.js",
      func: "rollbackDocumentVersion",
      request: oPayload,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default rollbackDocumentVersion;
