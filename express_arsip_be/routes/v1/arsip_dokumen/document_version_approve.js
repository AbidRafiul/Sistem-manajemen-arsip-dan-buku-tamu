import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const approveDocumentVersion = async (req, res) => {
  const oPayload = req.body;

  try {
    const nVersionId = oPayload.id_versi || oPayload.version_id;
    const cStatus = oPayload.status;
    const cApprovalNotes = oPayload.catatan_persetujuan || oPayload.approval_notes || null;
    const cApprovedBy =
      req?.auth?.username ||
      req?.context?.username ||
      req?.context?.Username ||
      oPayload.disetujui_oleh ||
      oPayload.approved_by ||
      "system";
    const dNow = new Date();

    // Validasi input
    if (!nVersionId) {
      const oResult = {
        status: "error",
        message: "id_versi wajib diisi",
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
    const oVersion = await DB("trs_versi_dokumen")
      .where("id_versi", nVersionId)
      .first();

    if (!oVersion) {
      const oResult = {
        status: "error",
        message: "Document version not found",
      };
      return res.status(404).json(oResult);
    }

    if (oVersion.status_persetujuan !== "pending") {
      const oResult = {
        status: "error",
        message: `Versi dokumen sudah diproses sebelumnya dengan status '${oVersion.status_persetujuan}'`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      status_persetujuan: cStatus,
      disetujui_oleh: cApprovedBy,
      disetujui_pada: dNow,
      catatan_persetujuan: cApprovalNotes,
      updated_at: dNow,
    };

    await DB("trs_versi_dokumen")
      .where("id_versi", nVersionId)
      .update(oData);

    const oResult = {
      status: "success",
      message: `Versi dokumen berhasil di-${cStatus === "approved" ? "setujui" : "tolak"}`,
      data: {
        id_versi: nVersionId,
        kode_dokumen: oVersion.kode_dokumen,
        nomor_versi: oVersion.nomor_versi,
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
      user: req?.auth?.username || req?.context?.username || req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default approveDocumentVersion;
