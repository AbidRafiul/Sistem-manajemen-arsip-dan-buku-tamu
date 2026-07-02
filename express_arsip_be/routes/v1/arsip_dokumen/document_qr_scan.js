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
    const oDocument = await DB("trs_dokumen as d")
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
        // Master data
        "dt.nama_jenis_dokumen",
        "dc.nama_kategori_dokumen",
        "ac.nama_klasifikasi",
        "cl.nama_tingkat_kerahasiaan",
        "rs.nama_retensi",
        "rs.tahun_retensi"
      )
      .leftJoin("mst_jenis_dokumen as dt", "d.kode_jenis_dokumen", "dt.kode_jenis_dokumen")
      .leftJoin("mst_kategori_dokumen as dc", "d.kode_kategori_dokumen", "dc.kode_kategori_dokumen")
      .leftJoin("mst_klasifikasi_arsip as ac", "d.kode_klasifikasi", "ac.kode_klasifikasi")
      .leftJoin("mst_tingkat_kerahasiaan as cl", "d.kode_tingkat_kerahasiaan", "cl.kode_tingkat_kerahasiaan")
      .leftJoin("mst_jadwal_retensi as rs", "d.kode_retensi", "rs.kode_retensi")
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
    const oLatestVersion = await DB("trs_versi_dokumen")
      .select("id_versi", "nomor_versi", "file_path", "created_at")
      .where("kode_dokumen", oDocument.kode_dokumen)
      .where("status_persetujuan", "approved")
      .orderBy("nomor_versi", "desc")
      .first();

    // Status peminjaman aktif
    const oActiveLoan = await DB("trs_peminjaman_arsip")
      .select("id_peminjaman", "nama_peminjam", "tanggal_pinjam", "tanggal_pengembalian", "status")
      .where("kode_dokumen", oDocument.kode_dokumen)
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
