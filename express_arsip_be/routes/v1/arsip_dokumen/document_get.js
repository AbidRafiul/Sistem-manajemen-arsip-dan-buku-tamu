import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocuments = async (req, res) => {
  try {
    const cSearch = req.query.search;
    const cStatus = req.query.status;
    const cPicName = req.query.picName;

    const oQuery = DB("trx_documents").select("*");

    if (cSearch) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("DocumentName", "like", `%${cSearch}%`)
          .orWhere("DocumentNumber", "like", `%${cSearch}%`);
      });
    }

    if (cStatus) {
      oQuery.andWhere("Status", cStatus);
    }

    if (cPicName) {
      oQuery.andWhere("PicName", "like", `%${cPicName}%`);
    }

    const vaData = await oQuery.orderBy("CreatedAt", "desc");

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
      request: req.query,
      response: oResult,
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocuments;
