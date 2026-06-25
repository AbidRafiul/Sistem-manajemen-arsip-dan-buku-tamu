import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentCategories = async (req, res) => {
  try {
    const cStatus = req.query.status || "active";

    const vaData = await DB("mst_document_categories as dc")
      .select(
        "dc.document_category_id",
        "dc.document_category_code",
        "dc.document_category_name",
        "dc.deskripsi",
        "dc.status",
        "ac.archive_classification_id",
        "ac.classification_code",
        "ac.classification_name",
      )
      .leftJoin(
        "mst_archive_classifications as ac",
        "dc.archive_classification_id",
        "ac.archive_classification_id",
      )
      .where("dc.status", cStatus)
      .orderBy("dc.document_category_name", "asc");

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
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocumentCategories;
