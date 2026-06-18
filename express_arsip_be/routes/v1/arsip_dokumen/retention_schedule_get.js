import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getRetentionSchedules = async (req, res) => {
  try {
    const cStatus = req.query.status || "active";
    const nDocumentCategoryId = req.query.document_category_id;

    const oQuery = DB("mst_retention_schedule as rs")
      .select(
        "rs.retention_schedule_id",
        "rs.retention_code",
        "rs.retention_name",
        "rs.retention_years",
        "rs.retention_action",
        "rs.description",
        "rs.status",
        "dc.document_category_id",
        "dc.document_category_name"
      )
      .leftJoin(
        "mst_document_categories as dc",
        "rs.document_category_id",
        "dc.document_category_id"
      )
      .where("rs.status", cStatus);

    if (nDocumentCategoryId) {
      oQuery.andWhere("rs.document_category_id", nDocumentCategoryId);
    }

    const vaData = await oQuery.orderBy("rs.retention_years", "asc");

    const oResult = {
      status: "success",
      message: "Retention schedules retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve retention schedules",
      error: error.message,
    };

    Logging(error, {
      file: "retention_schedule_get.js",
      func: "getRetentionSchedules",
      request: req.query,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getRetentionSchedules;
