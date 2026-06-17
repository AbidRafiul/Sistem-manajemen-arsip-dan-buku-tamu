import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getConfidentialityLevels = async (req, res) => {
  try {
    const cStatus = req.query.status || "active";

    const vaData = await DB("mst_confidentiality_levels")
      .select(
        "confidentiality_level_id",
        "confidentiality_level_code",
        "confidentiality_level_name",
        "confidentiality_level",
        "description",
        "status"
      )
      .where("status", cStatus)
      .orderBy("confidentiality_level", "asc");

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
