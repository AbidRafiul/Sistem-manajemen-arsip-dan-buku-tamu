import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const rollbackDocumentVersion = async (req, res) => {
  const oPayload = req.body;

  try {
    const cKodeDokumen = oPayload.kode_dokumen || oPayload.document_code;
    const nIdDokumen = oPayload.id_dokumen || oPayload.document_id;
    const nTargetVersionId = oPayload.id_versi || oPayload.version_id;
    const cUploadedBy = req?.context?.Username || oPayload.rollback_by || "system";
    const dNow = new Date();

    if ((!cKodeDokumen && !nIdDokumen) || !nTargetVersionId) {
      const oResult = {
        status: "error",
        message: "kode_dokumen/id_dokumen dan id_versi (target rollback) wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Verifikasi dokumen aktif
    let oDocument;
    if (cKodeDokumen) {
      oDocument = await DB("trs_dokumen")
        .where("kode_dokumen", cKodeDokumen)
        .where("status", "active")
        .first();
    } else {
      oDocument = await DB("trs_dokumen")
        .where("id_dokumen", nIdDokumen)
        .where("status", "active")
        .first();
    }

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found or already inactive",
      };
      return res.status(404).json(oResult);
    }

    // Ambil versi target yang akan di-rollback
    const oTargetVersion = await DB("trs_versi_dokumen")
      .where("id_versi", nTargetVersionId)
      .where("kode_dokumen", oDocument.kode_dokumen)
      .where("status_persetujuan", "approved")
      .first();

    if (!oTargetVersion) {
      const oResult = {
        status: "error",
        message: "Target version not found, not approved, or not belonging to this document",
      };
      return res.status(404).json(oResult);
    }

    // Ambil nomor versi terbaru untuk menentukan nomor versi baru
    const oLastVersion = await DB("trs_versi_dokumen")
      .select("nomor_versi")
      .where("kode_dokumen", oDocument.kode_dokumen)
      .orderBy("nomor_versi", "desc")
      .first();

    const nNewVersionNumber = oLastVersion ? oLastVersion.nomor_versi + 1 : 1;

    // Buat versi baru dengan FilePath dari versi target (rollback)
    const oNewVersion = {
      kode_dokumen: oDocument.kode_dokumen,
      nomor_versi: nNewVersionNumber,
      catatan_perubahan: `Rollback ke V${oTargetVersion.nomor_versi} (VersionId: ${nTargetVersionId})`,
      file_path: oTargetVersion.file_path,
      diunggah_oleh: cUploadedBy,
      // Rollback langsung approved (by system/user yang melakukan rollback)
      status_persetujuan: "approved",
      disetujui_oleh: cUploadedBy,
      disetujui_pada: dNow,
      catatan_persetujuan: `Auto-approved: rollback ke versi ${oTargetVersion.nomor_versi}`,
      tanggal_transaksi: dNow,
      created_at: dNow,
      updated_at: dNow,
    };

    const [nNewVersionId] = await DB("trs_versi_dokumen").insert(oNewVersion);

    const oResult = {
      status: "success",
      message: `Dokumen berhasil di-rollback ke V${oTargetVersion.nomor_versi}. Versi baru V${nNewVersionNumber} dibuat.`,
      data: {
        id_versi: nNewVersionId,
        rolled_back_from_version_id: nTargetVersionId,
        rolled_back_from_version_number: oTargetVersion.nomor_versi,
        new_version_number: nNewVersionNumber,
        ...oNewVersion,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to rollback document version",
      error: error.message,
    };

    Logging(error, {
      file: "document_version_rollback.js",
      func: "rollbackDocumentVersion",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default rollbackDocumentVersion;
