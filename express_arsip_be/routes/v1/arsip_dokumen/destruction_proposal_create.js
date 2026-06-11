import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const createDestructionProposal = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.DocumentId;
    const cProposalReason = oPayload.ProposalReason;
    const cProposedBy = req?.context?.Username || oPayload.ProposedBy || "system";
    const dNow = new Date();

    if (!nDocumentId || !cProposalReason) {
      const oResult = {
        status: "error",
        message: "DocumentId dan ProposalReason wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Verifikasi dokumen aktif
    const oDocument = await DB("trx_documents as d")
      .select(
        "d.DocumentId",
        "d.DocumentName",
        "d.DocumentNumber",
        "d.DocumentDate",
        "d.ExpiredDate",
        "d.RetentionScheduleId",
        "rs.RetentionYears",
        "rs.RetentionAction"
      )
      .leftJoin(
        "mst_retention_schedule as rs",
        "d.RetentionScheduleId",
        "rs.RetentionScheduleId"
      )
      .where("d.DocumentId", nDocumentId)
      .where("d.Status", "active")
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
      .where("DocumentId", nDocumentId)
      .whereNotIn("Status", ["rejected", "executed"])
      .first();

    if (oExistingProposal) {
      const oResult = {
        status: "error",
        message: `Dokumen ini sudah memiliki proposal pemusnahan aktif dengan status '${oExistingProposal.Status}' (ProposalId: ${oExistingProposal.ProposalId})`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      DocumentId: nDocumentId,
      RetentionScheduleId: oDocument.RetentionScheduleId || null,
      ProposalReason: cProposalReason,
      ProposedBy: cProposedBy,
      ProposedAt: dNow,
      Status: "submitted",
      ReviewedBy: null,
      ReviewedAt: null,
      ReviewNotes: null,
      ExecutedBy: null,
      ExecutedAt: null,
      BeritaAcaraPath: null,
      CreatedAt: dNow,
      UpdatedAt: dNow,
    };

    const [nProposalId] = await DB("trx_destruction_proposals").insert(oData);

    const oResult = {
      status: "success",
      message: "Proposal pemusnahan arsip berhasil diajukan dan menunggu review",
      data: {
        ProposalId: nProposalId,
        DocumentName: oDocument.DocumentName,
        DocumentNumber: oDocument.DocumentNumber,
        RetentionYears: oDocument.RetentionYears,
        RetentionAction: oDocument.RetentionAction,
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
