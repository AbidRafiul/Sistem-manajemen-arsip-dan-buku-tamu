import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const approveDocumentVersion = async (req, res) => {
  const oPayload = req.body;

  try {
    const nVersionId = oPayload.VersionId;
    const cStatus = oPayload.Status;
    const cApprovalNotes = oPayload.ApprovalNotes || null;
    const cApprovedBy = req?.context?.Username || oPayload.ApprovedBy || "system";
    const dNow = new Date();

    // Validasi input
    if (!nVersionId) {
      const oResult = {
        status: "error",
        message: "VersionId wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    if (!["approved", "rejected"].includes(cStatus)) {
      const oResult = {
        status: "error",
        message: "Status harus 'approved' atau 'rejected'",
      };
      return res.status(422).json(oResult);
    }

    // Cek versi ada dan masih pending
    const oVersion = await DB("trx_document_versions")
      .where("VersionId", nVersionId)
      .first();

    if (!oVersion) {
      const oResult = {
        status: "error",
        message: "Document version not found",
      };
      return res.status(404).json(oResult);
    }

    if (oVersion.ApprovalStatus !== "pending") {
      const oResult = {
        status: "error",
        message: `Versi dokumen sudah diproses sebelumnya dengan status '${oVersion.ApprovalStatus}'`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      ApprovalStatus: cStatus,
      ApprovedBy: cApprovedBy,
      ApprovedAt: dNow,
      ApprovalNotes: cApprovalNotes,
      UpdatedAt: dNow,
    };

    await DB("trx_document_versions")
      .where("VersionId", nVersionId)
      .update(oData);

    const oResult = {
      status: "success",
      message: `Versi dokumen berhasil di-${cStatus === "approved" ? "setujui" : "tolak"}`,
      data: {
        VersionId: nVersionId,
        DocumentId: oVersion.DocumentId,
        VersionNumber: oVersion.VersionNumber,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to process version approval",
      error: error.message,
    };

    Logging(error, {
      file: "document_version_approve.js",
      func: "approveDocumentVersion",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default approveDocumentVersion;
