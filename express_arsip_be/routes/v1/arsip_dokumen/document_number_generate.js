import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

/**
 * Helper untuk mendapatkan inisial kantor berdasarkan nama cabang
 */
export const getBranchInitial = (namaCabang) => {
  if (!namaCabang) return "JKT";
  const upper = String(namaCabang).toUpperCase();
  if (upper.includes("JAKARTA")) return "JKT";
  if (upper.includes("SURABAYA")) return "SBY";
  if (upper.includes("BANDUNG")) return "BND";
  if (upper.includes("SEMARANG")) return "SMG";
  if (upper.includes("YOGYAKARTA")) return "JOG";
  if (upper.includes("BALI")) return "BAL";
  if (upper.includes("CIMAHI")) return "CMH";
  if (upper.includes("MADIUN")) return "MDN";
  if (upper.includes("MOJOKERTO")) return "MJK";
  if (upper.includes("SIDOARJO")) return "SDA";
  if (upper.includes("SOREANG")) return "SRG";
  if (upper.includes("DEMAK")) return "DMK";
  if (upper.includes("KENDAL")) return "KDL";
  if (upper.includes("BANTUL")) return "BTL";
  if (upper.includes("SLEMAN")) return "SLM";
  if (upper.includes("DENPASAR")) return "DPS";
  if (upper.includes("GIANYAR")) return "GNY";

  // Fallback: ekstrak 3 huruf pertama dari nama lokasi
  const words = namaCabang.replace(/^(Pusat|Cabang|Unit|Kecamatan)\s+/i, "").trim().split(/\s+/);
  if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  if (words[0] && words[0].length >= 3) return words[0].substring(0, 3).toUpperCase();
  return "ADM";
};

const generateDocumentNumber = async (req, res) => {
  try {
    const cKlasifikasi = req.query.kode_klasifikasi || "ADM";
    const cKategori = req.query.kode_kategori_dokumen || "DOC";
    const dTanggal = req.query.tanggal ? new Date(req.query.tanggal) : new Date();

    // 1. Tentukan Cabang & Inisial Kantor berdasarkan Header x-filter-cabang / Context User
    let nIdCabang = null;
    const cFilterCabang = req.headers["x-filter-cabang"];
    if (cFilterCabang && cFilterCabang !== "null" && cFilterCabang !== "undefined") {
      const firstId = parseInt(String(cFilterCabang).split(",")[0], 10);
      if (!isNaN(firstId)) nIdCabang = firstId;
    }
    if (!nIdCabang) {
      nIdCabang = req.context?.id_cabang || req.auth?.id_cabang || 1;
    }

    const oBranch = await DB("mst_cabang").select("nama_cabang").where("id_cabang", nIdCabang).first();
    const cInisialKantor = getBranchInitial(oBranch?.nama_cabang);

    // 2. Format tanggal YYYYMMDD
    const cDateStr = formatDateSystem(dTanggal, "yyyyMMdd");

    // 3. Susun Prefix Penomoran (Format: [INISIAL]/[KLASIFIKASI]/[KATEGORI]/[YYYYMMDD]/)
    const cCleanKlasifikasi = String(cKlasifikasi).trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const cCleanKategori = String(cKategori).trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const cPrefix = `${cInisialKantor}/${cCleanKlasifikasi}/${cCleanKategori}/${cDateStr}/`;

    // 4. Cari urutan tertinggi di database untuk prefix hari ini
    const oLastDoc = await DB("trx_dokumen")
      .select("nomor_dokumen")
      .where("nomor_dokumen", "like", `${cPrefix}%`)
      .orderBy("id_dokumen", "desc")
      .first();

    let nSeq = 1;
    if (oLastDoc && oLastDoc.nomor_dokumen) {
      const parts = oLastDoc.nomor_dokumen.split("/");
      const lastSeqStr = parts[parts.length - 1];
      const lastSeq = parseInt(lastSeqStr, 10);
      if (!isNaN(lastSeq)) {
        nSeq = lastSeq + 1;
      }
    }

    const cSeqPadded = String(nSeq).padStart(4, "0");
    const cNomorDokumenFinal = `${cPrefix}${cSeqPadded}`;

    return res.status(200).json({
      status: "success",
      message: "Document number generated successfully",
      data: {
        nomor_dokumen: cNomorDokumenFinal,
        inisial_kantor: cInisialKantor,
        prefix: cPrefix,
        sequence: nSeq
      }
    });

  } catch (error) {
    const oResult = {
      status: "error",
      message: "Gagal me-generate nomor dokumen",
      error: error.message,
    };

    Logging(error, {
      file: "document_number_generate.js",
      func: "generateDocumentNumber",
      request: req.query,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

router.get("/", generateDocumentNumber);
export default router;
