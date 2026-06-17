import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

const generateDocumentQR = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.document_id;

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "document_id wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data dokumen
    const oDocument = await DB("trx_documents")
      .select("document_id", "document_name", "document_number", "qr_code", "status")
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

    // Gunakan QRCode yang sudah ada atau generate baru jika kosong
    let cQRCodeString = oDocument.qr_code;
    if (!cQRCodeString) {
      cQRCodeString = `DOC-${uuidv4()}`;

      // Simpan QR Code string ke database
      await DB("trx_documents")
        .where("document_id", nDocumentId)
        .update({
          qr_code: cQRCodeString,
          updated_at: new Date(),
        });
    }

    // Data yang akan diencode ke dalam QR Code
    const oQRData = {
      document_id: oDocument.document_id,
      document_number: oDocument.document_number,
      document_name: oDocument.document_name,
      qr_code: cQRCodeString,
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
        document_id: oDocument.document_id,
        document_number: oDocument.document_number,
        document_name: oDocument.document_name,
        qr_code: cQRCodeString,
        qr_base64: cQRBase64,
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
