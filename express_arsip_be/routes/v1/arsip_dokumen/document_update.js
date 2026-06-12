import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const updateDocument = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.DocumentId;
    const cDocumentName = oPayload.DocumentName;
    const cDocumentNumber = oPayload.DocumentNumber;
    const dDocumentDate = oPayload.DocumentDate;
    const dExpiredDate = oPayload.ExpiredDate || null;
    const cPicName = oPayload.PicName;
    const nDocumentTypeId = oPayload.DocumentTypeId || null;
    const nDocumentCategoryId = oPayload.DocumentCategoryId || null;
    const nArchiveClassificationId = oPayload.ArchiveClassificationId || null;
    const nConfidentialityLevelId = oPayload.ConfidentialityLevelId || null;
    const nRetentionScheduleId = oPayload.RetentionScheduleId || null;
    const cPhysicalLocation = oPayload.PhysicalLocation || null;
    const cTags = oPayload.Tags || null;
    const dNow = new Date();

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "DocumentId wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    if (!cDocumentName || !cDocumentNumber || !dDocumentDate || !cPicName) {
      const oResult = {
        status: "error",
        message: "DocumentName, DocumentNumber, DocumentDate, dan PicName wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Cek duplikat nomor dokumen (exclude dokumen yang sedang diedit)
    const oExisting = await DB("trx_documents")
      .where("DocumentNumber", cDocumentNumber)
      .where("Status", "active")
      .whereNot("DocumentId", nDocumentId)
      .first();

    if (oExisting) {
      const oResult = {
        status: "error",
        message: `Nomor dokumen ${cDocumentNumber} sudah digunakan oleh dokumen lain`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      ArchiveClassificationId: nArchiveClassificationId,
      DocumentTypeId: nDocumentTypeId,
      DocumentCategoryId: nDocumentCategoryId,
      ConfidentialityLevelId: nConfidentialityLevelId,
      RetentionScheduleId: nRetentionScheduleId,
      DocumentName: cDocumentName,
      DocumentNumber: cDocumentNumber,
      DocumentDate: dDocumentDate,
      ExpiredDate: dExpiredDate,
      PicName: cPicName,
      PhysicalLocation: cPhysicalLocation,
      Tags: cTags,
      UpdatedAt: dNow,
    };

    const nUpdated = await DB("trx_documents")
      .where("DocumentId", nDocumentId)
      .where("Status", "active")
      .update(oData);

    if (nUpdated === 0) {
      const oResult = {
        status: "error",
        message: "Document not found or already inactive",
      };
      return res.status(404).json(oResult);
    }

    const oResult = {
      status: "success",
      message: "Document metadata updated successfully",
      data: { DocumentId: nDocumentId, ...oData },
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
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default updateDocument;
