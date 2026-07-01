import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const updateDocument = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.id_dokumen;
    const cDocumentName = oPayload.nama_dokumen;
    const cDocumentNumber = oPayload.nomor_dokumen;
    const dDocumentDate = oPayload.tanggal;
    const dExpiredDate = oPayload.tanggal_kedaluwarsa || null;
    const cPicName = oPayload.nama_pic;
    const cDocumentTypeCode = oPayload.kode_jenis_dokumen || null;
    const cDocumentCategoryCode = oPayload.kode_kategori_dokumen || null;
    const cClassificationCode = oPayload.kode_klasifikasi || null;
    const cConfidentialityLevelCode = oPayload.kode_tingkat_kerahasiaan || null;
    const cRetentionCode = oPayload.kode_retensi || null;
    const cPhysicalLocation = oPayload.lokasi_fisik || null;
    const cTags = oPayload.tags || null;
    const dNow = new Date();

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "id_dokumen wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    if (!cDocumentName || !cDocumentNumber || !dDocumentDate || !cPicName) {
      const oResult = {
        status: "error",
        message: "nama_dokumen, nomor_dokumen, tanggal, dan nama_pic wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Cek duplikat nomor dokumen (exclude dokumen yang sedang diedit)
    const oExisting = await DB("trs_dokumen")
      .where("nomor_dokumen", cDocumentNumber)
      .where("status", "active")
      .whereNot("id_dokumen", nDocumentId)
      .first();

    if (oExisting) {
      const oResult = {
        status: "error",
        message: `Nomor dokumen ${cDocumentNumber} sudah digunakan oleh dokumen lain`,
      };
      return res.status(422).json(oResult);
    }

    const cKodeDokumen = `${cDocumentNumber}-${nDocumentId}`;

    const oData = {
      kode_dokumen: cKodeDokumen,
      kode_klasifikasi: cClassificationCode,
      kode_jenis_dokumen: cDocumentTypeCode,
      kode_kategori_dokumen: cDocumentCategoryCode,
      kode_tingkat_kerahasiaan: cConfidentialityLevelCode,
      kode_retensi: cRetentionCode,
      nama_dokumen: cDocumentName,
      nomor_dokumen: cDocumentNumber,
      tanggal: dDocumentDate,
      tanggal_kedaluwarsa: dExpiredDate,
      nama_pic: cPicName,
      lokasi_fisik: cPhysicalLocation,
      tags: cTags,
      updated_at: dNow,
    };

    const nUpdated = await DB("trs_dokumen")
      .where("id_dokumen", nDocumentId)
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
      data: { id_dokumen: nDocumentId, ...oData },
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
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default updateDocument;
