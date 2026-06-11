import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentDetail = async (req, res) => {
  const oQuery = req.query;

  try {
    const nDocumentId = oQuery.DocumentId;

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "DocumentId wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data dokumen + join ke semua master
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
        "d.CreatedAt",
        "d.UpdatedAt",
        // Master data
        "dt.DocumentTypeId",
        "dt.DocumentTypeName",
        "dc.DocumentCategoryId",
        "dc.DocumentCategoryName",
        "ac.ArchiveClassificationId",
        "ac.ClassificationCode",
        "ac.ClassificationName",
        "cl.ConfidentialityLevelId",
        "cl.ConfidentialityLevelName",
        "cl.ConfidentialityLevel",
        "rs.RetentionScheduleId",
        "rs.RetentionName",
        "rs.RetentionYears",
        "rs.RetentionAction"
      )
      .leftJoin("mst_document_type as dt", "d.DocumentTypeId", "dt.DocumentTypeId")
      .leftJoin("mst_document_categories as dc", "d.DocumentCategoryId", "dc.DocumentCategoryId")
      .leftJoin("mst_archive_classifications as ac", "d.ArchiveClassificationId", "ac.ArchiveClassificationId")
      .leftJoin("mst_confidentiality_levels as cl", "d.ConfidentialityLevelId", "cl.ConfidentialityLevelId")
      .leftJoin("mst_retention_schedule as rs", "d.RetentionScheduleId", "rs.RetentionScheduleId")
      .where("d.DocumentId", nDocumentId)
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
        "VersionId",
        "DocumentId",
        "VersionNumber",
        "ChangeNotes",
        "FilePath",
        "UploadedBy",
        "ApprovalStatus",
        "ApprovedBy",
        "ApprovedAt",
        "ApprovalNotes",
        "CreatedAt",
        "UpdatedAt"
      )
      .where("DocumentId", nDocumentId)
      .orderBy("VersionNumber", "desc");

    // Ambil riwayat peminjaman (terbaru dulu)
    const vaLoans = await DB("trx_archive_loans")
      .select(
        "LoanId",
        "DocumentId",
        "BorrowerName",
        "LoanDate",
        "ExpectedReturnDate",
        "ReturnDate",
        "Purpose",
        "Status",
        "ApprovedBy",
        "ApprovedAt",
        "ApprovalNotes",
        "IsOverdue",
        "CreatedAt",
        "UpdatedAt"
      )
      .where("DocumentId", nDocumentId)
      .orderBy("LoanId", "desc");

    // Cek apakah ada proposal pemusnahan aktif
    const oDestructionProposal = await DB("trx_destruction_proposals")
      .select(
        "ProposalId",
        "Status",
        "ProposedBy",
        "ProposedAt",
        "ReviewedBy",
        "ReviewedAt",
        "ReviewNotes"
      )
      .where("DocumentId", nDocumentId)
      .whereNotIn("Status", ["rejected", "executed"])
      .orderBy("ProposalId", "desc")
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
