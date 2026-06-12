import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getConfidentialityLevels = async (req, res) => {
  try {
    const cStatus = req.query.Status || "active";

    const vaData = await DB("mst_confidentiality_levels")
      .select(
        "ConfidentialityLevelId",
        "ConfidentialityLevelCode",
        "ConfidentialityLevelName",
        "ConfidentialityLevel",
        "Description",
        "Status"
      )
      .where("Status", cStatus)
      .orderBy("ConfidentialityLevel", "asc");

    const oResult = {
      status: "success",
      message: "Confidentiality levels retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve confidentiality levels",
      error: error.message,
    };

    Logging(error, {
      file: "confidentiality_level_get.js",
      func: "getConfidentialityLevels",
      request: req.query,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getConfidentialityLevels;
