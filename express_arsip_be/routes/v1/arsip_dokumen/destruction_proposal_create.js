import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const createDestructionProposal = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.document_id;
    const cProposalReason = oPayload.proposal_reason;
    const cProposedBy = req?.context?.Username || oPayload.proposed_by || "system";
    const dNow = new Date();

    if (!nDocumentId || !cProposalReason) {
      const oResult = {
        status: "error",
        message: "document_id dan proposal_reason wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Verifikasi dokumen aktif
    const oDocument = await DB("trx_documents as d")
      .select(
        "d.document_id",
        "d.document_name",
        "d.document_number",
        "d.document_date",
        "d.expired_date",
        "d.retention_schedule_id",
        "rs.retention_years",
        "rs.retention_action"
      )
      .leftJoin(
        "mst_retention_schedule as rs",
        "d.retention_schedule_id",
        "rs.retention_schedule_id"
      )
      .where("d.document_id", nDocumentId)
      .where("d.status", "active")
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found or already inactive",
      };
      return res.status(404).json(oResult);
    }

    // Cek apakah sudah ada proposal aktif untuk dokumen ini
    const oExistingProposal = await DB("trx_destruction_proposals")
      .where("document_id", nDocumentId)
      .whereNotIn("status", ["rejected", "executed"])
      .first();

    if (oExistingProposal) {
      const oResult = {
        status: "error",
        message: `Dokumen ini sudah memiliki proposal pemusnahan aktif dengan status '${oExistingProposal.status}' (ProposalId: ${oExistingProposal.proposal_id})`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      document_id: nDocumentId,
      retention_schedule_id: oDocument.retention_schedule_id || null,
      proposal_reason: cProposalReason,
      proposed_by: cProposedBy,
      proposed_at: dNow,
      status: "submitted",
      reviewed_by: null,
      reviewed_at: null,
      review_notes: null,
      executed_by: null,
      executed_at: null,
      berita_acara_path: null,
      created_at: dNow,
      updated_at: dNow,
    };

    const [nProposalId] = await DB("trx_destruction_proposals").insert(oData);

    const oResult = {
      status: "success",
      message: "Proposal pemusnahan arsip berhasil diajukan dan menunggu review",
      data: {
        proposal_id: nProposalId,
        document_name: oDocument.document_name,
        document_number: oDocument.document_number,
        retention_years: oDocument.retention_years,
        retention_action: oDocument.retention_action,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to create destruction proposal",
      error: error.message,
    };

    Logging(error, {
      file: "destruction_proposal_create.js",
      func: "createDestructionProposal",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default createDestructionProposal;
