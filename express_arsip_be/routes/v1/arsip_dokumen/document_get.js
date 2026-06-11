import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocuments = async (req, res) => {
  try {
    const cSearch = req.query.Search;
    const cStatus = req.query.Status;
    const cPicName = req.query.PicName;
    const nDocumentTypeId = req.query.DocumentTypeId;
    const nDocumentCategoryId = req.query.DocumentCategoryId;
    const nConfidentialityLevelId = req.query.ConfidentialityLevelId;
    const nArchiveClassificationId = req.query.ArchiveClassificationId;
    const cTags = req.query.Tags;
    const dDateFrom = req.query.DateFrom;
    const dDateTo = req.query.DateTo;
    const bExpiredOnly = req.query.ExpiredOnly === "true";

    const oQuery = DB("trx_documents as d")
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
        // Master joins
        "dt.DocumentTypeId",
        "dt.DocumentTypeName",
        "dc.DocumentCategoryId",
        "dc.DocumentCategoryName",
        "ac.ArchiveClassificationId",
        "ac.ClassificationName",
        "cl.ConfidentialityLevelId",
        "cl.ConfidentialityLevelName",
        "cl.ConfidentialityLevel",
        "rs.RetentionScheduleId",
        "rs.RetentionName",
        "rs.RetentionYears"
      )
      .leftJoin(
        "mst_document_type as dt",
        "d.DocumentTypeId",
        "dt.DocumentTypeId"
      )
      .leftJoin(
        "mst_document_categories as dc",
        "d.DocumentCategoryId",
        "dc.DocumentCategoryId"
      )
      .leftJoin(
        "mst_archive_classifications as ac",
        "d.ArchiveClassificationId",
        "ac.ArchiveClassificationId"
      )
      .leftJoin(
        "mst_confidentiality_levels as cl",
        "d.ConfidentialityLevelId",
        "cl.ConfidentialityLevelId"
      )
      .leftJoin(
        "mst_retention_schedule as rs",
        "d.RetentionScheduleId",
        "rs.RetentionScheduleId"
      );

    // Filter: status (default active)
    if (cStatus) {
      oQuery.where("d.Status", cStatus);
    } else {
      oQuery.where("d.Status", "active");
    }

    // Filter: pencarian teks (nama, nomor, PIC, tags)
    if (cSearch) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("d.DocumentName", "like", `%${cSearch}%`)
          .orWhere("d.DocumentNumber", "like", `%${cSearch}%`)
          .orWhere("d.PicName", "like", `%${cSearch}%`)
          .orWhere("d.Tags", "like", `%${cSearch}%`);
      });
    }

    // Filter: PIC
    if (cPicName) {
      oQuery.andWhere("d.PicName", "like", `%${cPicName}%`);
    }

    // Filter: tags
    if (cTags) {
      oQuery.andWhere("d.Tags", "like", `%${cTags}%`);
    }

    // Filter: jenis dokumen
    if (nDocumentTypeId) {
      oQuery.andWhere("d.DocumentTypeId", nDocumentTypeId);
    }

    // Filter: kategori dokumen
    if (nDocumentCategoryId) {
      oQuery.andWhere("d.DocumentCategoryId", nDocumentCategoryId);
    }

    // Filter: tingkat kerahasiaan
    if (nConfidentialityLevelId) {
      oQuery.andWhere("d.ConfidentialityLevelId", nConfidentialityLevelId);
    }

    // Filter: klasifikasi arsip
    if (nArchiveClassificationId) {
      oQuery.andWhere("d.ArchiveClassificationId", nArchiveClassificationId);
    }

    // Filter: rentang tanggal dokumen
    if (dDateFrom) {
      oQuery.andWhere("d.DocumentDate", ">=", dDateFrom);
    }
    if (dDateTo) {
      oQuery.andWhere("d.DocumentDate", "<=", dDateTo);
    }

    // Filter: hanya dokumen yang sudah expired
    if (bExpiredOnly) {
      oQuery.andWhere("d.ExpiredDate", "<=", DB.fn.now());
    }

    const vaData = await oQuery.orderBy("d.CreatedAt", "desc");

    const oResult = {
      status: "success",
      message: "Documents retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve documents",
      error: error.message,
    };

    Logging(error, {
      file: "document_get.js",
      func: "getDocuments",
      request: req.query,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocuments;
