import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const returnArchiveLoan = async (req, res) => {
  const oPayload = req.body;

  try {
    const nLoanId = oPayload.id_peminjaman || oPayload.loan_id;
    const dReturnDate = oPayload.tanggal_kembali || oPayload.return_date || null;
    const dNow = new Date();

    if (!nLoanId) {
      const oResult = {
        status: "error",
        message: "id_peminjaman wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data peminjaman
    const oLoan = await DB("trs_peminjaman_arsip")
      .where("id_peminjaman", nLoanId)
      .first();

    if (!oLoan) {
      const oResult = {
        status: "error",
        message: "Archive loan not found",
      };
      return res.status(404).json(oResult);
    }

    if (oLoan.status !== "borrowed") {
      const oResult = {
        status: "error",
        message: `Peminjaman tidak dalam status 'borrowed'. Status saat ini: '${oLoan.status}'`,
      };
      return res.status(422).json(oResult);
    }

    // Tanggal pengembalian aktual
    const dActualReturnDate = dReturnDate ? new Date(dReturnDate) : dNow;

    // Deteksi keterlambatan: bandingkan tanggal kembali aktual vs tanggal_pengembalian
    const bIsOverdue =
      oLoan.tanggal_pengembalian &&
      new Date(dActualReturnDate) > new Date(oLoan.tanggal_pengembalian)
        ? 1
        : 0;

    const oData = {
      status: "returned",
      tanggal_kembali: dActualReturnDate,
      terlambat: bIsOverdue,
      updated_at: dNow,
    };

    await DB("trs_peminjaman_arsip")
      .where("id_peminjaman", nLoanId)
      .update(oData);

    const cOverdueMessage = bIsOverdue
      ? ` (TERLAMBAT: seharusnya kembali ${oLoan.tanggal_pengembalian})`
      : "";

    const oResult = {
      status: "success",
      message: `Dokumen berhasil dikembalikan${cOverdueMessage}`,
      data: {
        id_peminjaman: nLoanId,
        kode_dokumen: oLoan.kode_dokumen,
        nama_peminjam: oLoan.nama_peminjam,
        tanggal_pengembalian: oLoan.tanggal_pengembalian,
        terlambat: bIsOverdue,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to return archive loan",
      error: error.message,
    };

    Logging(error, {
      file: "archive_loan_return.js",
      func: "returnArchiveLoan",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default returnArchiveLoan;