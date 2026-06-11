import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const scanDocumentQR = async (req, res) => {
  const oQuery = req.query;

  try {
    const cQRCode = oQuery.QRCode;

    if (!cQRCode) {
      const oResult = {
        status: "error",
        message: "QRCode wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Cari dokumen berdasarkan QR Code string
    const oDocument = await DB("trx_documents as d")
      .select(
        "d.DocumentId",
        "d.DocumentName",
        "d.DocumentNumber",
        "d.DocumentDate",
        "d.ExpiredDate",
        "d.PicName",
        "d.PhysicalLocation",
        "d.QRCode",
        "d.Tags",
        "d.Status",
        // Master data
        "dt.DocumentTypeName",
        "dc.DocumentCategoryName",
        "ac.ClassificationName",
        "cl.ConfidentialityLevelName",
        "rs.RetentionName",
        "rs.RetentionYears"
      )
      .leftJoin("mst_document_type as dt", "d.DocumentTypeId", "dt.DocumentTypeId")
      .leftJoin("mst_document_categories as dc", "d.DocumentCategoryId", "dc.DocumentCategoryId")
      .leftJoin("mst_archive_classifications as ac", "d.ArchiveClassificationId", "ac.ArchiveClassificationId")
      .leftJoin("mst_confidentiality_levels as cl", "d.ConfidentialityLevelId", "cl.ConfidentialityLevelId")
      .leftJoin("mst_retention_schedule as rs", "d.RetentionScheduleId", "rs.RetentionScheduleId")
      .where("d.QRCode", cQRCode)
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Dokumen dengan QR Code tersebut tidak ditemukan",
      };
      return res.status(404).json(oResult);
    }

    // Ambil versi terbaru yang approved
    const oLatestVersion = await DB("trx_document_versions")
      .select("VersionId", "VersionNumber", "FilePath", "CreatedAt")
      .where("DocumentId", oDocument.DocumentId)
      .where("ApprovalStatus", "approved")
      .orderBy("VersionNumber", "desc")
      .first();

    // Status peminjaman aktif
    const oActiveLoan = await DB("trx_archive_loans")
      .select("LoanId", "BorrowerName", "LoanDate", "ExpectedReturnDate", "Status")
      .where("DocumentId", oDocument.DocumentId)
      .where("Status", "borrowed")
      .first();

    const oResult = {
      status: "success",
      message: "Dokumen ditemukan",
      data: {
        document: oDocument,
        latestVersion: oLatestVersion || null,
        activeLoan: oActiveLoan || null,
        isCurrentlyBorrowed: !!oActiveLoan,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to scan QR Code",
      error: error.message,
    };

    Logging(error, {
      file: "document_qr_scan.js",
      func: "scanDocumentQR",
      request: oQuery,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default scanDocumentQR;
