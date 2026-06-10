import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const updateDocument = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.DocumentId;
    const cDocumentName = oPayload.DocumentName;
    const cDocumentNumber = oPayload.DocumentNumber;
    const dDocumentDate = oPayload.DocumentDate;
    const dExpiredDate = oPayload.ExpiredDate;
    const cPicName = oPayload.PicName;
    const dNow = new Date();

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "DocumentId is required",
      };

      return res.status(422).json(oResult);
    }

    const oData = {
      DocumentName: cDocumentName,
      DocumentNumber: cDocumentNumber,
      DocumentDate: dDocumentDate,
      ExpiredDate: dExpiredDate,
      PicName: cPicName,
      UpdatedAt: dNow,
    };

    const nUpdated = await DB("trx_documents")
      .where("DocumentId", nDocumentId)
      .where("Status", "active")
      .update(oData);

    if (nUpdated === 0) {
      const oResult = {
        status: "error",
        message: "Document not found",
      };

      return res.status(404).json(oResult);
    }

    const oResult = {
      status: "success",
      message: "Document metadata updated successfully",
      data: oData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to update document metadata",
      error: error.message,
    };

    Logging(error, {
      file: "document_update.js",
      func: "updateDocument",
      request: oPayload,
      response: oResult,
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default updateDocument;
