import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentCategories = async (req, res) => {
  try {
    const cStatus = req.query.Status || "active";

    const vaData = await DB("mst_document_categories as dc")
      .select(
        "dc.DocumentCategoryId",
        "dc.DocumentCategoryCode",
        "dc.DocumentCategoryName",
        "dc.Description",
        "dc.Status",
        "ac.ArchiveClassificationId",
        "ac.ClassificationCode",
        "ac.ClassificationName"
      )
      .leftJoin(
        "mst_archive_classifications as ac",
        "dc.ArchiveClassificationId",
        "ac.ArchiveClassificationId"
      )
      .where("dc.Status", cStatus)
      .orderBy("dc.DocumentCategoryName", "asc");

    const oResult = {
      status: "success",
      message: "Document categories retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve document categories",
      error: error.message,
    };

    Logging(error, {
      file: "document_category_get.js",
      func: "getDocumentCategories",
      request: req.query,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocumentCategories;
