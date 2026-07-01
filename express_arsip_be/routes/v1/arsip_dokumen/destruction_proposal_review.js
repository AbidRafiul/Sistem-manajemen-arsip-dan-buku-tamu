import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const reviewDestructionProposal = async (req, res) => {
  const oPayload = req.body;

  try {
    const nProposalId = oPayload.id_usulan || oPayload.proposal_id;
    const cStatus = oPayload.status;
    const cReviewNotes = oPayload.catatan_tinjauan || oPayload.review_notes || null;
    const cReviewedBy =
      req?.auth?.nama_pengguna ||
      req?.context?.nama_pengguna ||
      req?.context?.nama_pengguna ||
      oPayload.reviewed_by ||
      "system";
    const dNow = new Date();

    if (!nProposalId) {
      const oResult = {
        status: "error",
        message: "id_usulan wajib diisi",
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

    // Cek proposal ada dan masih bisa di-review
    const oProposal = await DB("trs_usulan_pemusnahan")
      .where("id_usulan", nProposalId)
      .first();

    if (!oProposal) {
      const oResult = {
        status: "error",
        message: "Destruction proposal not found",
      };
      return res.status(404).json(oResult);
    }

    if (oProposal.status !== "submitted") {
      const oResult = {
        status: "error",
        message: `Proposal tidak dalam status 'submitted'. Status saat ini: '${oProposal.status}'`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      status: cStatus,
      ditinjau_oleh: cReviewedBy,
      ditinjau_pada: dNow,
      catatan_tinjauan: cReviewNotes,
      updated_at: dNow,
    };

    await DB("trs_usulan_pemusnahan")
      .where("id_usulan", nProposalId)
      .update(oData);

    const oResult = {
      status: "success",
      message: `Proposal pemusnahan berhasil di-${cStatus === "approved" ? "setujui" : "tolak"}`,
      data: {
        id_usulan: nProposalId,
        kode_dokumen: oProposal.kode_dokumen,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to review destruction proposal",
      error: error.message,
    };

    Logging(error, {
      file: "destruction_proposal_review.js",
      func: "reviewDestructionProposal",
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

export default reviewDestructionProposal;
