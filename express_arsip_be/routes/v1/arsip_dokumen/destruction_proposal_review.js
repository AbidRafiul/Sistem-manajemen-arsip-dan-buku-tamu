import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const reviewDestructionProposal = async (req, res) => {
  const oPayload = req.body;

  try {
    const nProposalId = oPayload.ProposalId;
    const cStatus = oPayload.Status;
    const cReviewNotes = oPayload.ReviewNotes || null;
    const cReviewedBy = req?.context?.Username || oPayload.ReviewedBy || "system";
    const dNow = new Date();

    if (!nProposalId) {
      const oResult = {
        status: "error",
        message: "ProposalId wajib diisi",
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
      .where("ProposalId", nProposalId)
      .first();

    if (!oProposal) {
      const oResult = {
        status: "error",
        message: "Destruction proposal not found",
      };
      return res.status(404).json(oResult);
    }

    if (oProposal.Status !== "submitted") {
      const oResult = {
        status: "error",
        message: `Proposal tidak dalam status 'submitted'. Status saat ini: '${oProposal.Status}'`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      Status: cStatus,
      ReviewedBy: cReviewedBy,
      ReviewedAt: dNow,
      ReviewNotes: cReviewNotes,
      UpdatedAt: dNow,
    };

    await DB("trx_destruction_proposals")
      .where("ProposalId", nProposalId)
      .update(oData);

    const oResult = {
      status: "success",
      message: `Proposal pemusnahan berhasil di-${cStatus === "approved" ? "setujui" : "tolak"}`,
      data: {
        ProposalId: nProposalId,
        DocumentId: oProposal.DocumentId,
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
