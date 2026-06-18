import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentDetail = async (req, res) => {
  const oQuery = req.query;

  try {
    const nDocumentId = oQuery.document_id;

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "document_id wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data dokumen + join ke semua master
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
        "d.created_at",
        "d.updated_at",
        // Master data
        "dt.document_type_id",
        "dt.document_type_name",
        "dc.document_category_id",
        "dc.document_category_name",
        "ac.archive_classification_id",
        "ac.classification_code",
        "ac.classification_name",
        "cl.confidentiality_level_id",
        "cl.confidentiality_level_name",
        "cl.confidentiality_level",
        "rs.retention_schedule_id",
        "rs.retention_name",
        "rs.retention_years",
        "rs.retention_action"
      )
      .leftJoin("mst_document_type as dt", "d.document_type_id", "dt.document_type_id")
      .leftJoin("mst_document_categories as dc", "d.document_category_id", "dc.document_category_id")
      .leftJoin("mst_archive_classifications as ac", "d.archive_classification_id", "ac.archive_classification_id")
      .leftJoin("mst_confidentiality_levels as cl", "d.confidentiality_level_id", "cl.confidentiality_level_id")
      .leftJoin("mst_retention_schedule as rs", "d.retention_schedule_id", "rs.retention_schedule_id")
      .where("d.document_id", nDocumentId)
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found",
      };
      return res.status(404).json(oResult);
    }

    // Ambil semua versi dokumen (terbaru dulu), beserta info approval
    const vaVersions = await DB("trx_document_versions")
      .select(
        "version_id",
        "document_id",
        "version_number",
        "change_notes",
        "file_path",
        "uploaded_by",
        "approval_status",
        "approved_by",
        "approved_at",
        "approval_notes",
        "created_at",
        "updated_at"
      )
      .where("document_id", nDocumentId)
      .orderBy("version_number", "desc");

    // Ambil riwayat peminjaman (terbaru dulu)
    const vaLoans = await DB("trx_archive_loans")
      .select(
        "loan_id",
        "document_id",
        "borrower_name",
        "loan_date",
        "expected_return_date",
        "return_date",
        "purpose",
        "status",
        "approved_by",
        "approved_at",
        "approval_notes",
        "is_overdue",
        "created_at",
        "updated_at"
      )
      .where("document_id", nDocumentId)
      .orderBy("loan_id", "desc");

    // Cek apakah ada proposal pemusnahan aktif
    const oDestructionProposal = await DB("trx_destruction_proposals")
      .select(
        "proposal_id",
        "status",
        "proposed_by",
        "proposed_at",
        "reviewed_by",
        "reviewed_at",
        "review_notes"
      )
      .where("document_id", nDocumentId)
      .whereNotIn("status", ["rejected", "executed"])
      .orderBy("proposal_id", "desc")
      .first();

    const oResult = {
      status: "success",
      message: "Document detail retrieved successfully",
      data: {
        document: oDocument,
        versions: vaVersions,
        loans: vaLoans,
        destructionProposal: oDestructionProposal || null,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve document detail",
      error: error.message,
    };

    Logging(error, {
      file: "document_detail.js",
      func: "getDocumentDetail",
      request: oQuery,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocumentDetail;
