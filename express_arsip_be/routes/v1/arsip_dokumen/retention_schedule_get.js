import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getRetentionSchedules = async (req, res) => {
  try {
    const cStatus = req.query.Status || "active";
    const nDocumentCategoryId = req.query.DocumentCategoryId;

    const oQuery = DB("mst_retention_schedule as rs")
      .select(
        "rs.RetentionScheduleId",
        "rs.RetentionCode",
        "rs.RetentionName",
        "rs.RetentionYears",
        "rs.RetentionAction",
        "rs.Description",
        "rs.Status",
        "dc.DocumentCategoryId",
        "dc.DocumentCategoryName"
      )
      .leftJoin(
        "mst_document_categories as dc",
        "rs.DocumentCategoryId",
        "dc.DocumentCategoryId"
      )
      .where("rs.Status", cStatus);

    if (nDocumentCategoryId) {
      oQuery.andWhere("rs.DocumentCategoryId", nDocumentCategoryId);
    }

    const vaData = await oQuery.orderBy("rs.RetentionYears", "asc");

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
