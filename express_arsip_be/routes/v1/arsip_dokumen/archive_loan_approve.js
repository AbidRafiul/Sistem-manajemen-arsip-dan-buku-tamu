import Knex from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const approveArchiveLoan = async (req, res) => {
  const oPayload = req.body;

  try {
    const nLoanId = oPayload.id_peminjaman || oPayload.loan_id;
    const cStatus = oPayload.status || oPayload.status_persetujuan;
    const cApprovalNotes = oPayload.catatan_persetujuan || oPayload.approval_notes || null;
    const cApprovedBy =
      req?.auth?.nama_pengguna ||
      req?.context?.nama_pengguna ||
      req?.context?.nama_pengguna ||
      oPayload.approved_by ||
      "system";
    const dNow = new Date();

    if (!nLoanId) {
      const oResult = {
        status: "error",
        message: "id_peminjaman wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    if (!["approved", "rejected"].includes(cStatus)) {
      const oResult = {
        status: "error",
        message: "Status harus 'approved' atau 'rejected'",
      };
      return res.status(422).json(oResult);
    }

    // Cek loan ada dan masih pending
    const oLoan = await Knex("trs_peminjaman_arsip")
      .where("id_peminjaman", nLoanId)
      .first();

    if (!oLoan) {
      const oResult = {
        status: "error",
        message: "Archive loan not found",
      };
      return res.status(404).json(oResult);
    }

    if (oLoan.status !== "pending") {
      const oResult = {
        status: "error",
        message: `Peminjaman sudah diproses dengan status '${oLoan.status}'`,
      };
      return res.status(422).json(oResult);
    }

    // Jika approved, check apakah dokumen sedang dipinjam
    if (cStatus === "approved") {
      const oActiveLoan = await Knex("trs_peminjaman_arsip")
        .where("kode_dokumen", oLoan.kode_dokumen)
        .where("status", "borrowed")
        .first();

      if (oActiveLoan) {
        const oResult = {
          status: "error",
          message: `Dokumen sedang dipinjam oleh ${oActiveLoan.nama_peminjam} sejak ${oActiveLoan.tanggal_pinjam}. Tidak dapat menyetujui peminjaman baru.`,
        };
        return res.status(422).json(oResult);
      }
    }

    // Jika approved, ubah status jadi 'borrowed' (langsung bisa dipinjam)
    const cNewStatus = cStatus === "approved" ? "borrowed" : "rejected";

    const oData = {
      status: cNewStatus,
      disetujui_oleh: cApprovedBy,
      disetujui_pada: dNow,
      catatan_persetujuan: cApprovalNotes,
      updated_at: dNow,
    };

    await Knex("trs_peminjaman_arsip")
      .where("id_peminjaman", nLoanId)
      .update(oData);

    const oResult = {
      status: "success",
      message: `Peminjaman arsip berhasil di-${cStatus === "approved" ? "setujui (status: borrowed)" : "tolak"}`,
      data: {
        id_peminjaman: nLoanId,
        kode_dokumen: oLoan.kode_dokumen,
        nama_peminjam: oLoan.nama_peminjam,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to update archive loan",
      error: error.message,
    };

    Logging(error, {
      file: "archive_loan_approve.js",
      func: "approveArchiveLoan",
      request: oPayload,
      response: oResult,
      user:
        req?.auth?.nama_pengguna ||
        req?.context?.nama_pengguna ||
        req?.context?.nama_pengguna ||
        "system",
    });

    return res.status(500).json(oResult);
  }
};

export default approveArchiveLoan;
