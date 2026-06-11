import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

const generateDocumentQR = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.DocumentId;

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "DocumentId wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data dokumen
    const oDocument = await DB("trx_documents")
      .select("DocumentId", "DocumentName", "DocumentNumber", "QRCode", "Status")
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

    // Gunakan QRCode yang sudah ada atau generate baru jika kosong
    let cQRCodeString = oDocument.QRCode;
    if (!cQRCodeString) {
      cQRCodeString = `DOC-${uuidv4()}`;

      // Simpan QR Code string ke database
      await DB("trx_documents")
        .where("DocumentId", nDocumentId)
        .update({
          QRCode: cQRCodeString,
          UpdatedAt: new Date(),
        });
    }

    // Data yang akan diencode ke dalam QR Code
    const oQRData = {
      DocumentId: oDocument.DocumentId,
      DocumentNumber: oDocument.DocumentNumber,
      DocumentName: oDocument.DocumentName,
      QRCode: cQRCodeString,
    };

    // Generate QR Code sebagai base64 PNG
    const cQRBase64 = await QRCode.toDataURL(JSON.stringify(oQRData), {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    });

    const oResult = {
      status: "success",
      message: "QR Code berhasil di-generate",
      data: {
        DocumentId: oDocument.DocumentId,
        DocumentNumber: oDocument.DocumentNumber,
        DocumentName: oDocument.DocumentName,
        QRCode: cQRCodeString,
        QRBase64: cQRBase64,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to generate QR Code",
      error: error.message,
    };

    Logging(error, {
      file: "document_qr_generate.js",
      func: "generateDocumentQR",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default generateDocumentQR;
