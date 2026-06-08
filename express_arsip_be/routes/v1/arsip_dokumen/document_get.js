import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocuments = async (req, res) => {
  try {
    const vaData = await DB("trx_documents").select().where("Status", "active");

    const oResult = {
      status: "success",
      message: "Documents retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve documents",
      error: error.message,
    };

    Logging(error, {
      file: "document_get.js",
      func: "getDocuments",
      response: oResult,
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocuments;
