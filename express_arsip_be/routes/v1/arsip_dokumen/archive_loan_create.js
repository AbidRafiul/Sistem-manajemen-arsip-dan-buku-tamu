import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const createArchiveLoan = async (req, res) => {
  const oPayload = req.body;

  try {
    const cKodeDokumen = oPayload.kode_dokumen;
    const cBorrowerName = oPayload.nama_peminjam;
    const dLoanDate = oPayload.tanggal_pinjam;
    const dExpectedReturnDate = oPayload.tanggal_pengembalian;
    const cPurpose = oPayload.keperluan || null;
    const dNow = new Date();

    // Validasi wajib
    if (!cKodeDokumen || !cBorrowerName || !dLoanDate || !dExpectedReturnDate) {
      const oResult = {
        status: "error",
        message: "kode_dokumen, nama_peminjam, tanggal_pinjam, dan tanggal_pengembalian wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Validasi: tanggal_pengembalian tidak boleh sebelum tanggal_pinjam
    if (new Date(dExpectedReturnDate) <= new Date(dLoanDate)) {
      const oResult = {
        status: "error",
        message: "tanggal_pengembalian harus setelah tanggal_pinjam",
      };
      return res.status(422).json(oResult);
    }

    // Verifikasi dokumen aktif
    const oDocument = await DB("trs_dokumen")
      .where("kode_dokumen", cKodeDokumen)
      .where("status", "active")
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found or already inactive",
      };
      return res.status(404).json(oResult);
    }

    // Cek apakah dokumen sedang dipinjam (status = borrowed)
    const oActiveLoan = await DB("trs_peminjaman_arsip")
      .where("kode_dokumen", cKodeDokumen)
      .where("status", "borrowed")
      .first();

    if (oActiveLoan) {
      const oResult = {
        status: "error",
        message: `Dokumen sedang dipinjam oleh ${oActiveLoan.nama_peminjam} sejak ${oActiveLoan.tanggal_pinjam}. Tidak dapat mengajukan peminjaman baru.`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      kode_dokumen: cKodeDokumen,
      nama_peminjam: cBorrowerName,
      tanggal_pinjam: dLoanDate,
      tanggal_pengembalian: dExpectedReturnDate,
      tanggal_kembali: null,
      keperluan: cPurpose,
      status: "pending",
      disetujui_oleh: null,
      disetujui_pada: null,
      catatan_persetujuan: null,
      terlambat: 0,
      tanggal_transaksi: dLoanDate,
      created_at: dNow,
      updated_at: dNow,
    };

    const [nLoanId] = await DB("trs_peminjaman_arsip").insert(oData);

    const oResult = {
      status: "success",
      message: "Pengajuan peminjaman arsip berhasil dibuat dan menunggu approval",
      data: {
        id_peminjaman: nLoanId,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to create archive loan",
      error: error.message,
    };

    Logging(error, {
      file: "archive_loan_create.js",
      func: "createArchiveLoan",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default createArchiveLoan;
