import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { v4 as uuidv4 } from "uuid";

const createDocument = async (req, res) => {
  const oPayload = req.body;

  try {
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

    // Validasi wajib
    if (!cDocumentName || !cDocumentNumber || !dDocumentDate || !cPicName) {
      const oResult = {
        status: "error",
        message: "document_name, document_number, document_date, dan pic_name wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Cek duplikat nomor dokumen
    const oExisting = await DB("trx_documents")
      .where("document_number", cDocumentNumber)
      .where("status", "active")
      .first();

    if (oExisting) {
      const oResult = {
        status: "error",
        message: `Nomor dokumen ${cDocumentNumber} sudah terdaftar`,
      };
      return res.status(422).json(oResult);
    }

    // Generate QR Code string unik (format: DOC-<uuid>)
    const cQRCode = `DOC-${uuidv4()}`;

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
      qr_code: cQRCode,
      tags: cTags,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    };

    const [nDocumentId] = await DB("trx_documents").insert(oData);

    const oResult = {
      status: "success",
      message: "Document metadata saved successfully",
      data: {
        document_id: nDocumentId,
        qr_code: cQRCode,
        ...oData,
      },
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
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default createDocument;
