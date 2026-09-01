import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";

const router = express.Router();

/**
 * Unified Search Endpoint (Metadata + Full-Text OCR Search)
 */
const searchDocuments = async (req, res) => {
  const oQuery = req.query;
  try {
    const cQueryStr = oQuery.q || oQuery.search || "";
    const cMode = oQuery.mode || "all"; // 'metadata', 'content', 'all'
    const cDocumentTypeCode = oQuery.kode_jenis_dokumen || oQuery.document_type_id;
    const cDocumentCategoryCode = oQuery.kode_kategori_dokumen || oQuery.document_category_id;
    const cConfidentialityLevelCode = oQuery.kode_tingkat_kerahasiaan || oQuery.confidentiality_level_id;
    const cArchiveClassificationCode = oQuery.kode_klasifikasi || oQuery.archive_classification_id;

    if (!cQueryStr.trim()) {
      return res.status(200).json({
        status: "success",
        message: "Query kosong",
        data: [],
      });
    }

    const cleanQuery = cQueryStr.trim();
    let results = [];

    // Helper base query for document metadata
    const buildBaseQuery = () => {
      const q = DB("trx_dokumen as d")
        .select(
          "d.id_dokumen",
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
          "dt.nama_jenis_dokumen",
          "dc.nama_kategori_dokumen",
          "ac.nama_klasifikasi",
          "cl.nama_tingkat_kerahasiaan"
        )
        .leftJoin("mst_jenis_dokumen as dt", "d.kode_jenis_dokumen", "dt.kode_jenis_dokumen")
        .leftJoin("mst_kategori_dokumen as dc", "d.kode_kategori_dokumen", "dc.kode_kategori_dokumen")
        .leftJoin("mst_klasifikasi_arsip as ac", "d.kode_klasifikasi", "ac.kode_klasifikasi")
        .leftJoin("mst_tingkat_kerahasiaan as cl", "d.kode_tingkat_kerahasiaan", "cl.kode_tingkat_kerahasiaan")
        .leftJoin("mst_pengguna as u", function () {
          this.on(DB.raw("d.nama_pic COLLATE utf8mb4_unicode_ci = u.nama_lengkap COLLATE utf8mb4_unicode_ci"));
        })
        .where("d.status", "active");

      const fCabang = req.headers["x-filter-cabang"];
      if (fCabang && fCabang !== "null" && fCabang !== "undefined") {
        const vaCabangIds = String(fCabang).split(",").map(Number);
        q.where((builder) => {
          builder.whereIn("d.id_cabang", vaCabangIds).orWhere(function () {
            this.whereNull("d.id_cabang").whereIn("u.id_cabang", vaCabangIds);
          });
        });
      }

      if (cDocumentTypeCode) q.andWhere("d.kode_jenis_dokumen", cDocumentTypeCode);
      if (cDocumentCategoryCode) q.andWhere("d.kode_kategori_dokumen", cDocumentCategoryCode);
      if (cConfidentialityLevelCode) q.andWhere("d.kode_tingkat_kerahasiaan", cConfidentialityLevelCode);
      if (cArchiveClassificationCode) q.andWhere("d.kode_klasifikasi", cArchiveClassificationCode);

      return q;
    };

    // 1. Metadata Search
    if (cMode === "metadata" || cMode === "all") {
      const metaQuery = buildBaseQuery().where((b) => {
        b.where("d.nama_dokumen", "like", `%${cleanQuery}%`)
          .orWhere("d.nomor_dokumen", "like", `%${cleanQuery}%`)
          .orWhere("d.nama_pic", "like", `%${cleanQuery}%`)
          .orWhere("d.lokasi_fisik", "like", `%${cleanQuery}%`)
          .orWhere("dt.nama_jenis_dokumen", "like", `%${cleanQuery}%`)
          .orWhere("dc.nama_kategori_dokumen", "like", `%${cleanQuery}%`)
          .orWhere("ac.nama_klasifikasi", "like", `%${cleanQuery}%`);
      });

      const metaDocs = await metaQuery;
      metaDocs.forEach((doc) => {
        results.push({
          ...doc,
          source: "metadata",
          matched_field: doc.nama_dokumen.toLowerCase().includes(cleanQuery.toLowerCase())
            ? "Nama Dokumen"
            : doc.nomor_dokumen.toLowerCase().includes(cleanQuery.toLowerCase())
            ? "Nomor Dokumen"
            : "Metadata Dokumen",
          snippet: `Kategori: ${doc.nama_kategori_dokumen || "-"} | PIC: ${doc.nama_pic || "-"}`,
        });
      });
    }

    // 2. Full-Text Content Search (OCR / extracted text)
    if (cMode === "content" || cMode === "all") {
      const existingDocCodes = new Set(results.map((r) => r.kode_dokumen));

      // Attempt MySQL FULLTEXT MATCH, fallback to LIKE if boolean search returns empty
      let contentMatches = [];

      try {
        contentMatches = await DB("trx_konten_dokumen as k")
          .select("k.kode_dokumen", "k.konten_teks", "k.sumber_konten", "k.id_versi")
          .whereRaw(
            "MATCH(k.konten_teks) AGAINST(? IN BOOLEAN MODE)",
            [`*${cleanQuery}*`]
          )
          .andWhere("k.status_ocr", "completed");
      } catch (e) {
        // Fallback to LIKE search if FULLTEXT fails or mode isn't enabled
        contentMatches = [];
      }

      if (!contentMatches || contentMatches.length === 0) {
        contentMatches = await DB("trx_konten_dokumen as k")
          .select("k.kode_dokumen", "k.konten_teks", "k.sumber_konten", "k.id_versi")
          .where("k.konten_teks", "like", `%${cleanQuery}%`)
          .andWhere("k.status_ocr", "completed");
      }

      if (contentMatches.length > 0) {
        const docCodesToFetch = contentMatches
          .map((c) => c.kode_dokumen)
          .filter((code) => !existingDocCodes.has(code));

        if (docCodesToFetch.length > 0) {
          const contentDocs = await buildBaseQuery().whereIn("d.kode_dokumen", docCodesToFetch);

          contentDocs.forEach((doc) => {
            const match = contentMatches.find((m) => m.kode_dokumen === doc.kode_dokumen);
            let snippet = "";
            if (match && match.konten_teks) {
              const text = match.konten_teks;
              const idx = text.toLowerCase().indexOf(cleanQuery.toLowerCase());
              if (idx !== -1) {
                const start = Math.max(0, idx - 60);
                const end = Math.min(text.length, idx + cleanQuery.length + 60);
                snippet = "..." + text.substring(start, end).replace(/\n/g, " ") + "...";
              } else {
                snippet = text.substring(0, 120).replace(/\n/g, " ") + "...";
              }
            }

            results.push({
              ...doc,
              source: "content",
              matched_field: "Isi Konten Dokumen (OCR)",
              snippet: snippet,
            });
          });
        }
      }
    }

    return res.status(200).json({
      status: "success",
      message: `Berhasil menemukan ${results.length} dokumen`,
      data: results,
    });
  } catch (error) {
    Logging(error, {
      file: "document_search.js",
      func: "searchDocuments",
      request: oQuery,
    });
    return res.status(500).json({
      status: "error",
      message: "Gagal melakukan pencarian dokumen",
      error: error.message,
    });
  }
};

router.get("/", searchDocuments);
export default router;
