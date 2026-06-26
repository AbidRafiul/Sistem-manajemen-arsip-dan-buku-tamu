import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentDetail = async (req, res) => {
  const oQuery = req.query;

  try {
    const nDocumentId = oQuery.id_dokumen || oQuery.document_id;

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "id_dokumen wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data dokumen + join ke semua master
    const oDocument = await DB("trs_dokumen as d")
      .select(
        "d.id_dokumen",
        "d.kode_dokumen",
        "d.nama_dokumen",
        "d.nomor_dokumen",
        "d.tanggal",
        "d.tanggal_kedaluwarsa",
        "d.nama_pic",
        "d.lokasi_fisik",
        "d.qr_code",
        "d.tags",
        "d.status",
        "d.created_at",
        "d.updated_at",
        // Master data
        "dt.id_jenis_dokumen",
        "dt.kode_jenis_dokumen",
        "dt.nama_jenis_dokumen",
        "dc.id_kategori_dokumen",
        "dc.kode_kategori_dokumen",
        "dc.nama_kategori_dokumen",
        "ac.id_klasifikasi",
        "ac.kode_klasifikasi",
        "ac.nama_klasifikasi",
        "cl.id_tingkat_kerahasiaan",
        "cl.kode_tingkat_kerahasiaan",
        "cl.nama_tingkat_kerahasiaan",
        "cl.tingkat_kerahasiaan",
        "rs.id_jadwal_retensi",
        "rs.kode_retensi",
        "rs.nama_retensi",
        "rs.tahun_retensi",
        "rs.tindakan_retensi"
      )
      .leftJoin("mst_jenis_dokumen as dt", "d.kode_jenis_dokumen", "dt.kode_jenis_dokumen")
      .leftJoin("mst_kategori_dokumen as dc", "d.kode_kategori_dokumen", "dc.kode_kategori_dokumen")
      .leftJoin("mst_klasifikasi_arsip as ac", "d.kode_klasifikasi", "ac.kode_klasifikasi")
      .leftJoin("mst_tingkat_kerahasiaan as cl", "d.kode_tingkat_kerahasiaan", "cl.kode_tingkat_kerahasiaan")
      .leftJoin("mst_jadwal_retensi as rs", "d.kode_retensi", "rs.kode_retensi")
      .where("d.id_dokumen", nDocumentId)
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found",
      };
      return res.status(404).json(oResult);
    }

    // Ambil semua versi dokumen (terbaru dulu), beserta info approval (relasi: kode_dokumen)
    const vaVersions = await DB("trs_versi_dokumen")
      .select(
        "id_versi",
        "kode_dokumen",
        "nomor_versi",
        "catatan_perubahan",
        "file_path",
        "diunggah_oleh",
        "status_persetujuan",
        "disetujui_oleh",
        "disetujui_pada",
        "catatan_persetujuan",
        "created_at",
        "updated_at"
      )
      .where("kode_dokumen", oDocument.kode_dokumen)
      .orderBy("nomor_versi", "desc");

    // Ambil riwayat peminjaman (terbaru dulu) (relasi: kode_dokumen)
    const vaLoans = await DB("trs_peminjaman_arsip")
      .select(
        "id_peminjaman",
        "kode_dokumen",
        "nama_peminjam",
        "tanggal_pinjam",
        "tanggal_pengembalian",
        "tanggal_kembali",
        "keperluan",
        "status",
        "disetujui_oleh",
        "disetujui_pada",
        "catatan_persetujuan",
        "terlambat",
        "created_at",
        "updated_at"
      )
      .where("kode_dokumen", oDocument.kode_dokumen)
      .orderBy("id_peminjaman", "desc");

    // Cek apakah ada proposal pemusnahan aktif (relasi: kode_dokumen)
    const oDestructionProposal = await DB("trs_usulan_pemusnahan")
      .select(
        "id_usulan",
        "kode_dokumen",
        "status",
        "diusulkan_oleh",
        "diusulkan_pada",
        "ditinjau_oleh",
        "ditinjau_pada",
        "catatan_tinjauan"
      )
      .where("kode_dokumen", oDocument.kode_dokumen)
      .whereNotIn("status", ["rejected", "executed"])
      .orderBy("id_usulan", "desc")
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
