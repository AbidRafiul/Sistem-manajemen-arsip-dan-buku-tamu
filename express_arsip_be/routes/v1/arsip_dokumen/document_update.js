import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const updateDocument = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.document_id;
    const cDocumentName = oPayload.document_name;
    const cDocumentNumber = oPayload.document_number;
    const dDocumentDate = oPayload.document_date;
    const dExpiredDate = oPayload.expired_date || null;
    const cPicName = oPayload.pic_name;
    const nDocumentTypeId = oPayload.document_type_id || null;
    const nDocumentCategoryId = oPayload.document_category_id || null;
    const nArchiveClassificationId = oPayload.archive_classification_id || null;
    const nConfidentialityLevelId = oPayload.confidentiality_level_id || null;
    const nRetentionScheduleId = oPayload.retention_schedule_id || null;
    const cPhysicalLocation = oPayload.physical_location || null;
    const cTags = oPayload.tags || null;
    const dNow = new Date();

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "document_id wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    if (!cDocumentName || !cDocumentNumber || !dDocumentDate || !cPicName) {
      const oResult = {
        status: "error",
        message: "document_name, document_number, document_date, dan pic_name wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Cek duplikat nomor dokumen (exclude dokumen yang sedang diedit)
    const oExisting = await DB("trx_documents")
      .where("document_number", cDocumentNumber)
      .where("status", "active")
      .whereNot("document_id", nDocumentId)
      .first();

    if (oExisting) {
      const oResult = {
        status: "error",
        message: `Nomor dokumen ${cDocumentNumber} sudah digunakan oleh dokumen lain`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      archive_classification_id: nArchiveClassificationId,
      document_type_id: nDocumentTypeId,
      document_category_id: nDocumentCategoryId,
      confidentiality_level_id: nConfidentialityLevelId,
      retention_schedule_id: nRetentionScheduleId,
      document_name: cDocumentName,
      document_number: cDocumentNumber,
      document_date: dDocumentDate,
      expired_date: dExpiredDate,
      pic_name: cPicName,
      physical_location: cPhysicalLocation,
      tags: cTags,
      updated_at: dNow,
    };

    const nUpdated = await DB("trx_documents")
      .where("document_id", nDocumentId)
      .where("status", "active")
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
      data: { document_id: nDocumentId, ...oData },
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
