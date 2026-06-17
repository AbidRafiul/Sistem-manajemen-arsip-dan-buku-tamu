import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const reviewDestructionProposal = async (req, res) => {
  const oPayload = req.body;

  try {
    const nProposalId = oPayload.proposal_id;
    const cStatus = oPayload.status;
    const cReviewNotes = oPayload.review_notes || null;
    const cReviewedBy = req?.context?.Username || oPayload.reviewed_by || "system";
    const dNow = new Date();

    if (!nProposalId) {
      const oResult = {
        status: "error",
        message: "proposal_id wajib diisi",
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
    const oProposal = await DB("trx_destruction_proposals")
      .where("proposal_id", nProposalId)
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
      reviewed_by: cReviewedBy,
      reviewed_at: dNow,
      review_notes: cReviewNotes,
      updated_at: dNow,
    };

    await DB("trx_destruction_proposals")
      .where("proposal_id", nProposalId)
      .update(oData);

    const oResult = {
      status: "success",
      message: `Proposal pemusnahan berhasil di-${cStatus === "approved" ? "setujui" : "tolak"}`,
      data: {
        proposal_id: nProposalId,
        document_id: oProposal.document_id,
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
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default reviewDestructionProposal;
