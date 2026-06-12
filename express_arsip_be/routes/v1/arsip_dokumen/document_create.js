import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { v4 as uuidv4 } from "uuid";

const createDocument = async (req, res) => {
  const oPayload = req.body;

  try {
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

    // Validasi wajib
    if (!cDocumentName || !cDocumentNumber || !dDocumentDate || !cPicName) {
      const oResult = {
        status: "error",
        message: "DocumentName, DocumentNumber, DocumentDate, dan PicName wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Cek duplikat nomor dokumen
    const oExisting = await DB("trx_documents")
      .where("DocumentNumber", cDocumentNumber)
      .where("Status", "active")
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
      QRCode: cQRCode,
      Tags: cTags,
      Status: "active",
      CreatedAt: dNow,
      UpdatedAt: dNow,
    };

    const [nDocumentId] = await DB("trx_documents").insert(oData);

    const oResult = {
      status: "success",
      message: "Document metadata saved successfully",
      data: {
        DocumentId: nDocumentId,
        QRCode: cQRCode,
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
