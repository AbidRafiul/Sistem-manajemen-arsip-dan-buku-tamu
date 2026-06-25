import { Logging } from "../components/tools/servertool.js";

const uploadDocumentFile = async (req, res) => {
  const oPayload = req.body;

  try {
    const oFile = req.file;

    if (!oFile) {
      const oResult = {
        status: "error",
        message: "File tidak ditemukan",
      };

      return res.status(400).json(oResult);
    }

    const cFilePath = `/uploads/documents/${oFile.filename}`;

    const oResult = {
      status: "success",
      message: "File berhasil diunggah",
      data: cFilePath,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Gagal mengunggah file",
      error: error.message,
    };

    Logging(error, {
      file: "document_upload.js",
      func: "uploadDocumentFile",
      request: oPayload,
      response: oResult,
      user: req?.auth?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default uploadDocumentFile;
