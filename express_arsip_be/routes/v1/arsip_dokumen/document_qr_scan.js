import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const scanDocumentQR = async (req, res) => {
  const oQuery = req.query;

  try {
    const cQRCode = oQuery.qr_code;

    if (!cQRCode) {
      const oResult = {
        status: "error",
        message: "qr_code wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Cari dokumen berdasarkan QR Code string
    const oDocument = await DB("trx_documents as d")
      .select(
        "d.document_id",
        "d.document_name",
        "d.document_number",
        "d.document_date",
        "d.expired_date",
        "d.pic_name",
        "d.physical_location",
        "d.qr_code",
        "d.tags",
        "d.status",
        // Master data
        "dt.document_type_name",
        "dc.document_category_name",
        "ac.classification_name",
        "cl.confidentiality_level_name",
        "rs.retention_name",
        "rs.retention_years",
      )
      .leftJoin(
        "mst_document_type as dt",
        "d.document_type_id",
        "dt.document_type_id",
      )
      .leftJoin(
        "mst_document_categories as dc",
        "d.document_category_id",
        "dc.document_category_id",
      )
      .leftJoin(
        "mst_archive_classifications as ac",
        "d.archive_classification_id",
        "ac.archive_classification_id",
      )
      .leftJoin(
        "mst_confidentiality_levels as cl",
        "d.confidentiality_level_id",
        "cl.confidentiality_level_id",
      )
      .leftJoin(
        "mst_retention_schedule as rs",
        "d.retention_schedule_id",
        "rs.retention_schedule_id",
      )
      .where("d.qr_code", cQRCode)
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
      .select("version_id", "version_number", "file_path", "created_at")
      .where("document_id", oDocument.document_id)
      .where("approval_status", "approved")
      .orderBy("version_number", "desc")
      .first();

    // Status peminjaman aktif
    const oActiveLoan = await DB("trx_archive_loans")
      .select(
        "loan_id",
        "borrower_name",
        "loan_date",
        "expected_return_date",
        "status",
      )
      .where("document_id", oDocument.document_id)
      .where("status", "borrowed")
      .first();

    const oResult = {
      status: "success",
      message: "Dokumen ditemukan",
      data: {
        document: oDocument,
        latest_version: oLatestVersion || null,
        active_loan: oActiveLoan || null,
        is_currently_borrowed: !!oActiveLoan,
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
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default scanDocumentQR;
