import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getRetentionExpiredDocuments = async (req, res) => {
  try {
    const cStatus = req.query.status || "active";
    const nDocumentCategoryId = req.query.document_category_id;

    // Dokumen yang masa retensinya sudah habis:
    // DocumentDate + RetentionYears (dalam tahun) <= Hari ini
    // Menggunakan DATE_ADD MySQL untuk kalkulasi
    const oQuery = DB("trx_documents as d")
      .select(
        "d.document_id",
        "d.document_name",
        "d.document_number",
        "d.document_date",
        "d.expired_date",
        "d.pic_name",
        "d.physical_location",
        "d.status",
        "d.created_at",
        // Master data
        "dc.document_category_name",
        "rs.retention_schedule_id",
        "rs.retention_name",
        "rs.retention_years",
        "rs.retention_action",
        // Kalkulasi tanggal retensi berakhir
        DB.raw(
          "DATE_ADD(d.document_date, INTERVAL rs.retention_years YEAR) as RetentionEndDate",
        ),
        // Kalkulasi berapa tahun sudah lewat
        DB.raw(
          "TIMESTAMPDIFF(YEAR, DATE_ADD(d.document_date, INTERVAL rs.retention_years YEAR), NOW()) as YearsOverRetention",
        ),
        // Status proposal pemusnahan (jika ada)
        DB.raw(
          "(SELECT status FROM trx_destruction_proposals WHERE document_id = d.document_id AND status NOT IN ('rejected', 'executed') LIMIT 1) as ActiveProposalStatus",
        ),
      )
      .join(
        "mst_retention_schedule as rs",
        "d.retention_schedule_id",
        "rs.retention_schedule_id",
      )
      .leftJoin(
        "mst_document_categories as dc",
        "d.document_category_id",
        "dc.document_category_id",
      )
      .where("d.status", cStatus)
      // Kondisi utama: masa retensi sudah lewat
      .whereRaw(
        "DATE_ADD(d.document_date, INTERVAL rs.retention_years YEAR) <= NOW()",
      );

    if (nDocumentCategoryId) {
      oQuery.andWhere("d.document_category_id", nDocumentCategoryId);
    }

    const vaData = await oQuery.orderBy("d.document_date", "asc");

    const oResult = {
      status: "success",
      message: "Retention-expired documents retrieved successfully",
      data: vaData,
      total: vaData.length,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve retention-expired documents",
      error: error.message,
    };

    Logging(error, {
      file: "retention_expired_get.js",
      func: "getRetentionExpiredDocuments",
      request: req.query,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getRetentionExpiredDocuments;
