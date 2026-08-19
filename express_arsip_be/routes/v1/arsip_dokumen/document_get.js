import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";

const getDocuments = async (req, res) => {
  try {
    const cSearch = req.query.search;
    const cStatus = req.query.status;
    const cPicName = req.query.nama_pic || req.query.pic_name;
    const cDocumentTypeCode = req.query.kode_jenis_dokumen || req.query.document_type_id;
    const cDocumentCategoryCode = req.query.kode_kategori_dokumen || req.query.document_category_id;
    const cConfidentialityLevelCode = req.query.kode_tingkat_kerahasiaan || req.query.confidentiality_level_id;
    const cArchiveClassificationCode = req.query.kode_klasifikasi || req.query.archive_classification_id;
    const dDateFrom = req.query.date_from || req.query.tanggal_dari;
    const dDateTo = req.query.date_to || req.query.tanggal_sampai;
    const bExpiredOnly = req.query.expired_only === "true";

    const oQuery = DB("trx_dokumen as d")
      .select(
        "d.id_dokumen",
        "d.id_cabang",
        "cb.nama_cabang",
        "d.kode_dokumen",
        "d.nama_dokumen",
        "d.nomor_dokumen",
        "d.tanggal",
        "d.tanggal_transaksi",
        "d.tanggal_kedaluwarsa",
        "d.nama_pic",
        "d.lokasi_fisik",
        "d.qr_code",
        "d.status",
        "d.created_at",
        "d.updated_at",
        DB.raw(
          "(SELECT file_path FROM trx_versi_dokumen WHERE trx_versi_dokumen.kode_dokumen = d.kode_dokumen AND status_persetujuan = 'approved' ORDER BY nomor_versi DESC LIMIT 1) as file_path"
        ),
        // Master joins
        "dt.id_jenis_dokumen as id_jenis_dokumen",
        "dt.kode_jenis_dokumen as kode_jenis_dokumen",
        "dt.nama_jenis_dokumen as nama_jenis_dokumen",
        "dc.id_kategori_dokumen as id_kategori_dokumen",
        "dc.kode_kategori_dokumen as kode_kategori_dokumen",
        "dc.nama_kategori_dokumen as nama_kategori_dokumen",
        "ac.id_klasifikasi as id_klasifikasi",
        "ac.kode_klasifikasi as kode_klasifikasi",
        "ac.nama_klasifikasi as nama_klasifikasi",
        "cl.id_tingkat_kerahasiaan as id_tingkat_kerahasiaan",
        "cl.kode_tingkat_kerahasiaan as kode_tingkat_kerahasiaan",
        "cl.nama_tingkat_kerahasiaan as nama_tingkat_kerahasiaan",
        "cl.tingkat_kerahasiaan as tingkat_kerahasiaan",
        "rs.id_jadwal_retensi as id_jadwal_retensi",
        "rs.kode_retensi as kode_retensi",
        "rs.nama_retensi as nama_retensi",
        "rs.tahun_retensi as tahun_retensi"
      )
      .leftJoin(
        "mst_jenis_dokumen as dt",
        "d.kode_jenis_dokumen",
        "dt.kode_jenis_dokumen"
      )
      .leftJoin(
        "mst_kategori_dokumen as dc",
        "d.kode_kategori_dokumen",
        "dc.kode_kategori_dokumen"
      )
      .leftJoin(
        "mst_klasifikasi_arsip as ac",
        "d.kode_klasifikasi",
        "ac.kode_klasifikasi"
      )
      .leftJoin(
        "mst_tingkat_kerahasiaan as cl",
        "d.kode_tingkat_kerahasiaan",
        "cl.kode_tingkat_kerahasiaan"
      )
      .leftJoin(
        "mst_jadwal_retensi as rs",
        "d.kode_retensi",
        "rs.kode_retensi"
      )
      .leftJoin("mst_pengguna as u", function () {
        this.on(DB.raw("d.nama_pic COLLATE utf8mb4_unicode_ci = u.nama_lengkap COLLATE utf8mb4_unicode_ci"));
      })
      .leftJoin("mst_cabang as cb", function () {
        this.on(DB.raw("COALESCE(d.id_cabang, u.id_cabang) = cb.id_cabang"));
      });

    // Multi-tenancy filter (Direct branch filter with fallback for legacy docs)
    const fCabang = req.headers["x-filter-cabang"];
    if (fCabang && fCabang !== "null" && fCabang !== "undefined") {
      const vaCabangIds = String(fCabang).split(",").map(Number);
      oQuery.where((builder) => {
        builder.whereIn("d.id_cabang", vaCabangIds).orWhere(function () {
          this.whereNull("d.id_cabang").whereIn("u.id_cabang", vaCabangIds);
        });
      });
    }

    // Filter: status (default active)
    if (cStatus) {
      oQuery.where("d.status", cStatus);
    } else {
      oQuery.whereNot("d.status", "deleted");
    }

    // Filter: pencarian teks (nama, nomor, PIC, tags)
    if (cSearch) {
      oQuery.where((oBuilder) => {
        oBuilder
          .where("d.nama_dokumen", "like", `%${cSearch}%`)
          .orWhere("d.nomor_dokumen", "like", `%${cSearch}%`)
          .orWhere("d.nama_pic", "like", `%${cSearch}%`);
      });
    }

    // Filter: PIC
    if (cPicName) {
      oQuery.andWhere("d.nama_pic", "like", `%${cPicName}%`);
    }

    // Filter: jenis dokumen (bisa ID atau Code)
    if (cDocumentTypeCode) {
      if (isNaN(cDocumentTypeCode)) {
        oQuery.andWhere("d.kode_jenis_dokumen", cDocumentTypeCode);
      } else {
        oQuery.andWhere("dt.id_jenis_dokumen", parseInt(cDocumentTypeCode, 10));
      }
    }

    // Filter: kategori dokumen (bisa ID atau Code)
    if (cDocumentCategoryCode) {
      if (isNaN(cDocumentCategoryCode)) {
        oQuery.andWhere("d.kode_kategori_dokumen", cDocumentCategoryCode);
      } else {
        oQuery.andWhere("dc.id_kategori_dokumen", parseInt(cDocumentCategoryCode, 10));
      }
    }

    // Filter: tingkat kerahasiaan (bisa ID atau Code)
    if (cConfidentialityLevelCode) {
      if (isNaN(cConfidentialityLevelCode)) {
        oQuery.andWhere("d.kode_tingkat_kerahasiaan", cConfidentialityLevelCode);
      } else {
        oQuery.andWhere("cl.id_tingkat_kerahasiaan", parseInt(cConfidentialityLevelCode, 10));
      }
    }

    // Filter: klasifikasi arsip (bisa ID atau Code)
    if (cArchiveClassificationCode) {
      if (isNaN(cArchiveClassificationCode)) {
        oQuery.andWhere("d.kode_klasifikasi", cArchiveClassificationCode);
      } else {
        oQuery.andWhere("ac.id_klasifikasi", parseInt(cArchiveClassificationCode, 10));
      }
    }

    // Filter: rentang tanggal dokumen
    if (dDateFrom) {
      oQuery.andWhere("d.tanggal", ">=", dDateFrom);
    }
    if (dDateTo) {
      oQuery.andWhere("d.tanggal", "<=", dDateTo);
    }

    // Filter: hanya dokumen yang sudah expired
    if (bExpiredOnly) {
      oQuery.andWhere("d.tanggal_kedaluwarsa", "<=", DB.fn.now());
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
