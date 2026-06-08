import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const createDocument = async (req, res) => {
  try {
    const oPayload = req.body;

    const cDocumentName = oPayload.DocumentName;
    const cDocumentNumber = oPayload.DocumentNumber;
    const dDocumentDate = oPayload.DocumentDate;
    const dExpiredDate = oPayload.ExpiredDate;
    const cPicName = oPayload.PicName;
    const dNow = new Date();

    const oData = {
      DocumentName: cDocumentName,
      DocumentNumber: cDocumentNumber,
      DocumentDate: dDocumentDate,
      ExpiredDate: dExpiredDate,
      PicName: cPicName,
      CreatedAt: dNow,
      UpdatedAt: dNow,
    };


    await DB("trx_documents").insert(oData);

    const oResult = {
      status: "success",
      message: "Document metadata saved successfully",
      data: oData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to save document metadata",
      error: error.message,
    };

    Logging(error, {
      file: "document_create.js",
      func: "createDocument",
      request: oPayload,
      response: oResult,
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default createDocument;
