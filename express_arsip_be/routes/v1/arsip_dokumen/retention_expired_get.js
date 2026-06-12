import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getRetentionExpiredDocuments = async (req, res) => {
  try {
    const cStatus = req.query.Status || "active";
    const nDocumentCategoryId = req.query.DocumentCategoryId;

    // Dokumen yang masa retensinya sudah habis:
    // DocumentDate + RetentionYears (dalam tahun) <= Hari ini
    // Menggunakan DATE_ADD MySQL untuk kalkulasi
    const oQuery = DB("trx_documents as d")
      .select(
        "d.DocumentId",
        "d.DocumentName",
        "d.DocumentNumber",
        "d.DocumentDate",
        "d.ExpiredDate",
        "d.PicName",
        "d.PhysicalLocation",
        "d.Status",
        "d.CreatedAt",
        // Master data
        "dc.DocumentCategoryName",
        "rs.RetentionScheduleId",
        "rs.RetentionName",
        "rs.RetentionYears",
        "rs.RetentionAction",
        // Kalkulasi tanggal retensi berakhir
        DB.raw(
          "DATE_ADD(d.DocumentDate, INTERVAL rs.RetentionYears YEAR) as RetentionEndDate"
        ),
        // Kalkulasi berapa tahun sudah lewat
        DB.raw(
          "TIMESTAMPDIFF(YEAR, DATE_ADD(d.DocumentDate, INTERVAL rs.RetentionYears YEAR), NOW()) as YearsOverRetention"
        ),
        // Status proposal pemusnahan (jika ada)
        DB.raw(
          "(SELECT Status FROM trx_destruction_proposals WHERE DocumentId = d.DocumentId AND Status NOT IN ('rejected', 'executed') LIMIT 1) as ActiveProposalStatus"
        )
      )
      .join(
        "mst_retention_schedule as rs",
        "d.RetentionScheduleId",
        "rs.RetentionScheduleId"
      )
      .leftJoin(
        "mst_document_categories as dc",
        "d.DocumentCategoryId",
        "dc.DocumentCategoryId"
      )
      .where("d.Status", cStatus)
      // Kondisi utama: masa retensi sudah lewat
      .whereRaw(
        "DATE_ADD(d.DocumentDate, INTERVAL rs.RetentionYears YEAR) <= NOW()"
      );

    if (nDocumentCategoryId) {
      oQuery.andWhere("d.DocumentCategoryId", nDocumentCategoryId);
    }

    const vaData = await oQuery.orderBy("d.DocumentDate", "asc");

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
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getRetentionExpiredDocuments;
