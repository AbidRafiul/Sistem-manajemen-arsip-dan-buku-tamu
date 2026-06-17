import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDestructionProposals = async (req, res) => {
  try {
    const cStatus = req.query.status;
    const nDocumentId = req.query.document_id;
    const cProposedBy = req.query.proposed_by;

    const oQuery = DB("trx_destruction_proposals as dp")
      .select(
        "dp.proposal_id",
        "dp.document_id",
        "dp.retention_schedule_id",
        "dp.proposal_reason",
        "dp.proposed_by",
        "dp.proposed_at",
        "dp.status",
        "dp.reviewed_by",
        "dp.reviewed_at",
        "dp.review_notes",
        "dp.executed_by",
        "dp.executed_at",
        "dp.berita_acara_path",
        "dp.created_at",
        "dp.updated_at",
        // Data dokumen
        "d.document_name",
        "d.document_number",
        "d.document_date",
        "d.expired_date",
        "d.pic_name",
        // Data retensi
        "rs.retention_name",
        "rs.retention_years",
        "rs.retention_action"
      )
      .leftJoin("trx_documents as d", "dp.document_id", "d.document_id")
      .leftJoin(
        "mst_retention_schedule as rs",
        "dp.retention_schedule_id",
        "rs.retention_schedule_id"
      );

    if (cStatus) {
      oQuery.where("dp.status", cStatus);
    }

    if (nDocumentId) {
      oQuery.andWhere("dp.document_id", nDocumentId);
    }

    if (cProposedBy) {
      oQuery.andWhere("dp.proposed_by", "like", `%${cProposedBy}%`);
    }

    const vaData = await oQuery.orderBy("dp.proposed_at", "desc");

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
