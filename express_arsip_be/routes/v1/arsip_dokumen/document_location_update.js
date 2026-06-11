import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const updateDocumentLocation = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.DocumentId;
    const cPhysicalLocation = oPayload.PhysicalLocation;
    const dNow = new Date();

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "DocumentId wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // PhysicalLocation boleh kosong (untuk clear lokasi)
    const oDocument = await DB("trx_documents")
      .where("DocumentId", nDocumentId)
      .where("Status", "active")
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found or already inactive",
      };
      return res.status(404).json(oResult);
    }

    const oData = {
      PhysicalLocation: cPhysicalLocation || null,
      UpdatedAt: dNow,
    };

    await DB("trx_documents")
      .where("DocumentId", nDocumentId)
      .update(oData);

    const oResult = {
      status: "success",
      message: "Lokasi fisik dokumen berhasil diperbarui",
      data: {
        DocumentId: nDocumentId,
        DocumentNumber: oDocument.DocumentNumber,
        DocumentName: oDocument.DocumentName,
        OldLocation: oDocument.PhysicalLocation,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to update document location",
      error: error.message,
    };

    Logging(error, {
      file: "document_location_update.js",
      func: "updateDocumentLocation",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default updateDocumentLocation;
