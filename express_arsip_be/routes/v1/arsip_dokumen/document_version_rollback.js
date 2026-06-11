import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const rollbackDocumentVersion = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.DocumentId;
    const nTargetVersionId = oPayload.VersionId;
    const cUploadedBy = req?.context?.Username || oPayload.RollbackBy || "system";
    const dNow = new Date();

    if (!nDocumentId || !nTargetVersionId) {
      const oResult = {
        status: "error",
        message: "DocumentId dan VersionId (target rollback) wajib diisi",
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

    // Ambil versi target yang akan di-rollback
    const oTargetVersion = await DB("trx_document_versions")
      .where("VersionId", nTargetVersionId)
      .where("DocumentId", nDocumentId)
      .where("ApprovalStatus", "approved")
      .first();

    if (!oTargetVersion) {
      const oResult = {
        status: "error",
        message: "Target version not found, not approved, or not belonging to this document",
      };
      return res.status(404).json(oResult);
    }

    // Ambil nomor versi terbaru untuk menentukan nomor versi baru
    const oLastVersion = await DB("trx_document_versions")
      .select("VersionNumber")
      .where("DocumentId", nDocumentId)
      .orderBy("VersionNumber", "desc")
      .first();

    const nNewVersionNumber = oLastVersion ? oLastVersion.VersionNumber + 1 : 1;

    // Buat versi baru dengan FilePath dari versi target (rollback)
    const oNewVersion = {
      DocumentId: nDocumentId,
      VersionNumber: nNewVersionNumber,
      ChangeNotes: `Rollback ke V${oTargetVersion.VersionNumber} (VersionId: ${nTargetVersionId})`,
      FilePath: oTargetVersion.FilePath,
      UploadedBy: cUploadedBy,
      // Rollback langsung approved (by system/user yang melakukan rollback)
      ApprovalStatus: "approved",
      ApprovedBy: cUploadedBy,
      ApprovedAt: dNow,
      ApprovalNotes: `Auto-approved: rollback ke versi ${oTargetVersion.VersionNumber}`,
      CreatedAt: dNow,
      UpdatedAt: dNow,
    };

    const [nNewVersionId] = await DB("trx_document_versions").insert(oNewVersion);

    const oResult = {
      status: "success",
      message: `Dokumen berhasil di-rollback ke V${oTargetVersion.VersionNumber}. Versi baru V${nNewVersionNumber} dibuat.`,
      data: {
        VersionId: nNewVersionId,
        RolledBackFromVersionId: nTargetVersionId,
        RolledBackFromVersionNumber: oTargetVersion.VersionNumber,
        NewVersionNumber: nNewVersionNumber,
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
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default rollbackDocumentVersion;
