import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const approveDocumentVersion = async (req, res) => {
  const oPayload = req.body;

  try {
    const nVersionId = oPayload.version_id;
    const cStatus = oPayload.status;
    const cApprovalNotes = oPayload.approval_notes || null;
    const cApprovedBy =
      req?.auth?.nama_pengguna ||
      req?.context?.nama_pengguna ||
      req?.context?.nama_pengguna ||
      oPayload.approved_by ||
      "system";
    const dNow = new Date();

    // Validasi input
    if (!nVersionId) {
      const oResult = {
        status: "error",
        message: "version_id wajib diisi",
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
      .where("version_id", nVersionId)
      .first();

    if (!oVersion) {
      const oResult = {
        status: "error",
        message: "Document version not found",
      };
      return res.status(404).json(oResult);
    }

    if (oVersion.approval_status !== "pending") {
      const oResult = {
        status: "error",
        message: `Versi dokumen sudah diproses sebelumnya dengan status '${oVersion.approval_status}'`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      approval_status: cStatus,
      approved_by: cApprovedBy,
      approved_at: dNow,
      approval_notes: cApprovalNotes,
      updated_at: dNow,
    };

    await DB("trx_document_versions")
      .where("version_id", nVersionId)
      .update(oData);

    const oResult = {
      status: "success",
      message: `Versi dokumen berhasil di-${cStatus === "approved" ? "setujui" : "tolak"}`,
      data: {
        version_id: nVersionId,
        document_id: oVersion.document_id,
        version_number: oVersion.version_number,
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
      user:
        req?.auth?.nama_pengguna ||
        req?.context?.nama_pengguna ||
        req?.context?.nama_pengguna ||
        "system",
    });

    return res.status(500).json(oResult);
  }
};

export default approveDocumentVersion;
