import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { loadObjectBuffer, verifyPdfBuffer } from "../components/tools/tte_service.js";
import { status, datetime } from "../components/tools/general.js";

const getVerifikasiDokumen = async (req, res) => {
  const token = req.params.token_verifikasi;

  try {
    if (!token) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Token verifikasi wajib diisi",
      });
    }

    const signature = await DB("trs_tanda_tangan_dokumen as ttd")
      .leftJoin("mst_pengguna as u", "ttd.id_pengguna", "u.id_pengguna")
      .leftJoin("mst_sertifikat_elektronik as mse", "ttd.id_sertifikat_elektronik", "mse.id_sertifikat_elektronik")
      .select(
        "ttd.*",
        "u.nama_lengkap as nama_penanda_tangan",
        "u.nama_pengguna as username_penanda_tangan",
        "mse.nama_sertifikat",
        "mse.alias_sertifikat",
      )
      .where("ttd.token_verifikasi", token)
      .where("ttd.status_tanda_tangan", "aktif")
      .orderBy("ttd.created_at", "desc")
      .first();

    if (!signature) {
      return res.status(404).json({
        status: status.BAD_REQUEST,
        message: "Dokumen tanda tangan tidak ditemukan",
      });
    }

    const pdfBuffer = await loadObjectBuffer(signature.lokasi_dokumen);
    const verification = await verifyPdfBuffer(pdfBuffer);
    const verificationResult = verification.signatures?.[0] || {};

    const latestVerification = await DB("trs_verifikasi_dokumen")
      .where("token_verifikasi", token)
      .orderBy("diverifikasi_pada", "desc")
      .first();

    return res.status(200).json({
      status: status.SUKSES,
      message: "Verifikasi dokumen berhasil diambil",
      data: {
        dokumen_tertandatangan: verification.dokumen_tertandatangan,
        valid_kriptografis: verificationResult.valid_kriptografis || verification.valid_kriptografis,
        valid_integritas: verificationResult.valid_integritas || verification.valid_integritas,
        valid_sertifikat: verificationResult.valid_sertifikat || verification.valid_sertifikat,
        sertifikat_dipercaya: verificationResult.sertifikat_dipercaya || verification.sertifikat_dipercaya,
        sertifikat_dicabut: verificationResult.sertifikat_dicabut || verification.sertifikat_dicabut,
        dokumen_diubah: verificationResult.dokumen_diubah || verification.dokumen_diubah,
        pesan_verifikasi: verificationResult.pesan_verifikasi || "Dokumen berhasil diverifikasi",
        nama_penanda_tangan: signature.nama_penanda_tangan || signature.username_penanda_tangan || "-",
        jabatan_penanda_tangan: signature.subjek_sertifikat || "-",
        nomor_seri_sertifikat: signature.nomor_seri_sertifikat || signature.nomor_seri || "-",
        penerbit_sertifikat: signature.penerbit_sertifikat || "-",
        waktu_tanda_tangan: signature.waktu_tanda_tangan,
        token_verifikasi: signature.token_verifikasi,
        lokasi_dokumen: signature.lokasi_dokumen,
        validasi_terakhir: latestVerification || null,
      },
    });
  } catch (error) {
    await Logging(error, {
      file: "verifikasi_get.js",
      func: "getVerifikasiDokumen",
      request: JSON.stringify({ token_verifikasi: token }),
      response: "Verifikasi dokumen gagal diambil",
      user: "",
    });

    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Verifikasi dokumen gagal diambil",
    });
  }
};

export default getVerifikasiDokumen;
