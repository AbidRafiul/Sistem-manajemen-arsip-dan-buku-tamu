import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const updateDocumentLocation = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.document_id;
    const cPhysicalLocation = oPayload.physical_location;
    const dNow = new Date();

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "document_id wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // PhysicalLocation boleh kosong (untuk clear lokasi)
    const oDocument = await DB("trx_documents")
      .where("document_id", nDocumentId)
      .where("status", "active")
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found or already inactive",
      };
      return res.status(404).json(oResult);
    }

    const oData = {
      physical_location: cPhysicalLocation || null,
      updated_at: dNow,
    };

    await DB("trx_documents").where("document_id", nDocumentId).update(oData);

    const oResult = {
      status: "success",
      message: "Lokasi fisik dokumen berhasil diperbarui",
      data: {
        document_id: nDocumentId,
        document_number: oDocument.document_number,
        document_name: oDocument.document_name,
        old_location: oDocument.physical_location,
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
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default updateDocumentLocation;
