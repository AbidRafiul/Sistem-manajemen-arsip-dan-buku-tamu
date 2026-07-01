import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { v4 as uuidv4 } from "uuid";

const createDocument = async (req, res) => {
  const oPayload = req.body;

  try {
    const cDocumentName = oPayload.nama_dokumen;
    const cDocumentNumber = oPayload.nomor_dokumen;
    const dDocumentDate = oPayload.tanggal;
    const dExpiredDate = oPayload.tanggal_kedaluwarsa || null;
    const cDocumentTypeCode = oPayload.kode_jenis_dokumen || null;
    const cDocumentCategoryCode = oPayload.kode_kategori_dokumen || null;
    const cClassificationCode = oPayload.kode_klasifikasi || null;
    const cConfidentialityLevelCode = oPayload.kode_tingkat_kerahasiaan || null;
    const cRetentionCode = oPayload.kode_retensi || null;
    const cPhysicalLocation = oPayload.lokasi_fisik || null;
    const cTags = oPayload.tags || null;
    const dNow = new Date();

    // Validasi wajib
    if (!cDocumentName || !cDocumentNumber || !dDocumentDate) {
      const oResult = {
        status: "error",
        message: "nama_dokumen, nomor_dokumen, dan tanggal wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Logika Fallback Pintar untuk Variabel cPic
    let cPic = oPayload.nama_pic;
    if (typeof cPic === "string") {
      cPic = cPic.trim();
    }
    if (!cPic) {
      cPic = req.user?.name || "System Fallback (User Master Pending)";
    }

    // Cek duplikat nomor dokumen
    const oExisting = await DB("trs_dokumen")
      .where("nomor_dokumen", cDocumentNumber)
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
      kode_klasifikasi: cClassificationCode,
      kode_jenis_dokumen: cDocumentTypeCode,
      kode_kategori_dokumen: cDocumentCategoryCode,
      kode_tingkat_kerahasiaan: cConfidentialityLevelCode,
      kode_retensi: cRetentionCode,
      nama_dokumen: cDocumentName,
      nomor_dokumen: cDocumentNumber,
      tanggal: dDocumentDate,
      tanggal_kedaluwarsa: dExpiredDate,
      nama_pic: cPic,
      lokasi_fisik: cPhysicalLocation,
      qr_code: cQRCode,
      tags: cTags,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    };

    const nDocumentId = await DB.transaction(async (trx) => {
      const [nId] = await trx("trs_dokumen").insert(oData);
      const cKodeDokumen = `${cDocumentNumber}-${nId}`;
      await trx("trs_dokumen")
        .where("id_dokumen", nId)
        .update({ kode_dokumen: cKodeDokumen });
      return nId;
    });

    const oResult = {
      status: "success",
      message: "Document metadata registered successfully",
      data: {
        id_dokumen: nDocumentId,
        nama_pic: cPic,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    Logging("error", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to save document metadata",
      error: error.message,
    });
  }
};

export default createDocument;
