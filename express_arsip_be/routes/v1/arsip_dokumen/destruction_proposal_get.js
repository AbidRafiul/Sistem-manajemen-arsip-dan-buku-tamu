import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDestructionProposals = async (req, res) => {
  try {
    const cStatus = req.query.Status;
    const nDocumentId = req.query.DocumentId;
    const cProposedBy = req.query.ProposedBy;

    const oQuery = DB("trx_destruction_proposals as dp")
      .select(
        "dp.ProposalId",
        "dp.DocumentId",
        "dp.RetentionScheduleId",
        "dp.ProposalReason",
        "dp.ProposedBy",
        "dp.ProposedAt",
        "dp.Status",
        "dp.ReviewedBy",
        "dp.ReviewedAt",
        "dp.ReviewNotes",
        "dp.ExecutedBy",
        "dp.ExecutedAt",
        "dp.BeritaAcaraPath",
        "dp.CreatedAt",
        "dp.UpdatedAt",
        // Data dokumen
        "d.DocumentName",
        "d.DocumentNumber",
        "d.DocumentDate",
        "d.ExpiredDate",
        "d.PicName",
        // Data retensi
        "rs.RetentionName",
        "rs.RetentionYears",
        "rs.RetentionAction"
      )
      .leftJoin("trx_documents as d", "dp.DocumentId", "d.DocumentId")
      .leftJoin(
        "mst_retention_schedule as rs",
        "dp.RetentionScheduleId",
        "rs.RetentionScheduleId"
      );

    if (cStatus) {
      oQuery.where("dp.Status", cStatus);
    }

    if (nDocumentId) {
      oQuery.andWhere("dp.DocumentId", nDocumentId);
    }

    if (cProposedBy) {
      oQuery.andWhere("dp.ProposedBy", "like", `%${cProposedBy}%`);
    }

    const vaData = await oQuery.orderBy("dp.ProposedAt", "desc");

    const oResult = {
      status: "success",
      message: "Destruction proposals retrieved successfully",
      data: vaData,
      total: vaData.length,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve destruction proposals",
      error: error.message,
    };

    Logging(error, {
      file: "destruction_proposal_get.js",
      func: "getDestructionProposals",
      request: req.query,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDestructionProposals;
