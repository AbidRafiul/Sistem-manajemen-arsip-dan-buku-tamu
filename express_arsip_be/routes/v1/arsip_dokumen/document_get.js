import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocuments = async (req, res) => {
  try {
    const cSearch = req.query.search;
    const cStatus = req.query.status;
    const cPicName = req.query.pic_name;
    const nDocumentTypeId = req.query.document_type_id;
    const nDocumentCategoryId = req.query.document_category_id;
    const nConfidentialityLevelId = req.query.confidentiality_level_id;
    const nArchiveClassificationId = req.query.archive_classification_id;
    const cTags = req.query.tags;
    const dDateFrom = req.query.date_from;
    const dDateTo = req.query.date_to;
    const bExpiredOnly = req.query.expired_only === "true";

    const oQuery = DB("trx_documents as d")
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
        // Master joins
        "dt.document_type_id as document_type_id",
        "dt.document_type_name as document_type_name",
        "dc.document_category_id as document_category_id",
        "dc.document_category_name as document_category_name",
        "ac.archive_classification_id as archive_classification_id",
        "ac.classification_name as classification_name",
        "cl.confidentiality_level_id as confidentiality_level_id",
        "cl.confidentiality_level_name as confidentiality_level_name",
        "cl.confidentiality_level as confidentiality_level",
        "rs.retention_schedule_id as retention_schedule_id",
        "rs.retention_name as retention_name",
        "rs.retention_years as retention_years",
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
      );

    // Filter: status (default active)
    if (cStatus) {
      oQuery.where("d.status", cStatus);
    } else {
      oQuery.where("d.status", "active");
    }

    // Filter: pencarian teks (nama, nomor, PIC, tags)
    if (cSearch) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("d.document_name", "like", `%${cSearch}%`)
          .orWhere("d.document_number", "like", `%${cSearch}%`)
          .orWhere("d.pic_name", "like", `%${cSearch}%`)
          .orWhere("d.tags", "like", `%${cSearch}%`);
      });
    }

    // Filter: PIC
    if (cPicName) {
      oQuery.andWhere("d.pic_name", "like", `%${cPicName}%`);
    }

    // Filter: tags
    if (cTags) {
      oQuery.andWhere("d.tags", "like", `%${cTags}%`);
    }

    // Filter: jenis dokumen
    if (nDocumentTypeId) {
      oQuery.andWhere("d.document_type_id", nDocumentTypeId);
    }

    // Filter: kategori dokumen
    if (nDocumentCategoryId) {
      oQuery.andWhere("d.document_category_id", nDocumentCategoryId);
    }

    // Filter: tingkat kerahasiaan
    if (nConfidentialityLevelId) {
      oQuery.andWhere("d.confidentiality_level_id", nConfidentialityLevelId);
    }

    // Filter: klasifikasi arsip
    if (nArchiveClassificationId) {
      oQuery.andWhere("d.archive_classification_id", nArchiveClassificationId);
    }

    // Filter: rentang tanggal dokumen
    if (dDateFrom) {
      oQuery.andWhere("d.document_date", ">=", dDateFrom);
    }
    if (dDateTo) {
      oQuery.andWhere("d.document_date", "<=", dDateTo);
    }

    // Filter: hanya dokumen yang sudah expired
    if (bExpiredOnly) {
      oQuery.andWhere("d.expired_date", "<=", DB.fn.now());
    }

    const vaData = await oQuery.orderBy("d.created_at", "desc");

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
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocuments;
