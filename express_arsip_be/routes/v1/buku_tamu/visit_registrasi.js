import express from "express";
import multer from "multer";
import Joi from "joi";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging, validatePayload, generateDailyVisitCode } from "../components/tools/servertool.js";
import DB from "../../../core/config/knex.js";
import { uploadFileToMinio, getMinioPrefix, MINIO_BUCKET_NAME } from "../../../core/components/tools/minio_helper.js";
import { sendMailNotification } from "../../../core/components/tools/mail_helper.js";
import { sendWhatsAppMessage } from "../../../core/components/tools/wa_helper.js";

const cBucket = MINIO_BUCKET_NAME;

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/",
  upload.any(),
  async (req, res) => {
    const { body: oPayload } = req;
    const nama_pengguna = req?.auth?.nama_pengguna || "";

    try {
      const cValidation = await validatePayload(
        {
          GuestName: Joi.string().max(100).required().label("GuestName"),
          PhoneNumber: Joi.string().max(45).required().label("PhoneNumber"),
          GuestEmail: Joi.string()
            .email()
            .max(150)
            .optional()
            .allow(null, "")
            .label("GuestEmail"),
          GuestCompany: Joi.string()
            .optional()
            .allow(null, "")
            .label("GuestCompany"),
          GuestPosition: Joi.string()
            .max(20)
            .optional()
            .allow(null, "")
            .label("GuestPosition"),
          VisitPurposeId: Joi.alternatives()
            .try(Joi.string(), Joi.number())
            .required()
            .label("VisitPurposeId"),
          HostUserId: Joi.string()
            .max(36)
            .optional()
            .allow(null, "")
            .label("HostUserId"),
          HostName: Joi.string()
            .max(100)
            .optional()
            .allow(null, "")
            .label("HostName"),
          IdentityType: Joi.string()
            .valid("ktp", "sim", "paspor")
            .optional()
            .allow(null, "")
            .label("IdentityType"),
          IdentityNumber: Joi.string()
            .max(50)
            .optional()
            .allow(null, "")
            .label("IdentityNumber"),
          VisitNotes: Joi.string()
            .optional()
            .allow(null, "")
            .label("VisitNotes"),
          CheckInTime: Joi.string().required().label("CheckInTime"),
          VisitType: Joi.string()
            .valid("personal", "group")
            .optional()
            .allow(null, "")
            .label("VisitType"),
          GuestCount: Joi.number()
            .integer()
            .min(1)
            .optional()
            .allow(null, "")
            .label("GuestCount"),
          SignatureData: Joi.string()
            .optional()
            .allow(null, "")
            .label("SignatureData"),
          GroupMembers: Joi.string()
            .optional()
            .allow(null, "")
            .label("GroupMembers"),
          ApprovalStatus: Joi.string()
            .valid("approved", "pending", "rejected")
            .optional()
            .allow(null, "")
            .label("ApprovalStatus"),
        },
        {
          "string.base": "{#label} harus berupa string",
          "string.email": "{#label} harus berupa email yang valid",
          "string.empty": "{#label} tidak boleh kosong",
          "string.max": "{#label} tidak boleh lebih dari {#limit} karakter",
          "any.required": "{#label} wajib diisi",
          "any.only": "{#label} tidak valid",
        },
        oPayload,
        { allowUnknown: true },
      );

      if (cValidation) {
        const oResult = {
          status: "99",
          message: cValidation || "Terdapat kesalahan pada data anda",
          datetime: formatDateSystem(),
        };
        return res.status(400).json(oResult);
      }

      const {
        GuestName,
        PhoneNumber,
        GuestEmail,
        GuestCompany,
        GuestPosition,
        VisitPurposeId,
        HostUserId,
        HostName,
        IdentityType,
        IdentityNumber,
        VisitNotes,
        CheckInTime,
        VisitType,
        GuestCount,
        SignatureData,
        GroupMembers,
      } = oPayload;

      const minioPrefix = await getMinioPrefix(
        req?.auth?.id_cabang,
        req?.auth?.id_departemen,
        req?.auth?.id_divisi,
        req?.auth?.id_unit_kerja,
      );

      let targetBranchId = req?.auth?.id_cabang || null;
      if (oPayload.BranchId) {
        targetBranchId = Number(oPayload.BranchId);
      }

      const getFile = (fieldname) => {
        if (!req.files || !Array.isArray(req.files)) return null;
        return req.files.find((f) => f.fieldname === fieldname) || null;
      };

      const photoFaceFile = getFile("PhotoFaceFile") || getFile("PhotoFace");
      const photoIdentityFile = getFile("IdentityFile") || getFile("PhotoIdentity");
      const signatureFile = getFile("SignatureFile");
      const nYear = new Date().getFullYear();
      const cTodayPath = formatDateSystem(new Date(), "yyyyMMdd");

      let PhotoFace = null;
      let PhotoIdentity = null;
      let TandaTangan = null;

      if (photoFaceFile) {
        PhotoFace = await uploadFileToMinio(
          cBucket,
          photoFaceFile,
          `${minioPrefix}/buku-tamu/foto/${nYear}/${cTodayPath}`,
        );
      }
      if (photoIdentityFile) {
        PhotoIdentity = await uploadFileToMinio(
          cBucket,
          photoIdentityFile,
          `${minioPrefix}/buku-tamu/foto/${nYear}/${cTodayPath}`,
        );
      }

      if (SignatureData && SignatureData.startsWith("data:image/")) {
        const matches = SignatureData.match(new RegExp("^data:([A-Za-z-+/]+);base64,(.+)$"));
        if (matches && matches.length === 3) {
          const type = matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          const ext = type.split("/")[1] || "png";
          const fileObj = {
            originalname: `signature_${Date.now()}.${ext}`,
            mimetype: type,
            buffer: buffer,
            size: buffer.length,
          };
          TandaTangan = await uploadFileToMinio(
            cBucket,
            fileObj,
            `${minioPrefix}/buku-tamu/tanda-tangan/${nYear}/${cTodayPath}`,
          );
        }
      } else if (signatureFile) {
        TandaTangan = await uploadFileToMinio(
          cBucket,
          signatureFile,
          `${minioPrefix}/buku-tamu/tanda-tangan/${nYear}/${cTodayPath}`,
        );
      }

      const VisitCode = await generateDailyVisitCode();
      const QRToken =
        Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

      let resolvedHostUserId = HostUserId;
      if (!resolvedHostUserId && HostName) {
        const matchedUser = await DB("mst_pengguna")
          .where("nama_lengkap", HostName)
          .orWhere("nama_pengguna", HostName)
          .orWhere("surel", HostName)
          .first();
        if (matchedUser) {
          resolvedHostUserId = matchedUser.id_pengguna;
        }
      }

      const isInternalUser = !!req?.auth?.nama_pengguna || !!req?.auth?.id_pengguna;
      const defaultStatus = isInternalUser ? "approved" : "pending";
      const initialStatusPersetujuan = (oPayload.ApprovalStatus || oPayload.status_persetujuan || defaultStatus).toLowerCase();

      const oData = {
        id_cabang: targetBranchId,
        nama_tamu: GuestName,
        nomor_telepon: PhoneNumber,
        email_tamu: GuestEmail,
        instansi_tamu: GuestCompany,
        jabatan_tamu: GuestPosition,
        jenis_identitas: IdentityType && IdentityType !== "" ? String(IdentityType).toLowerCase() : null,
        nomor_identitas: IdentityNumber && IdentityNumber !== "" ? IdentityNumber : null,
        id_tujuan_kunjungan: VisitPurposeId,
        id_user_host: resolvedHostUserId || null,
        nama_host: HostName,
        catatan_kunjungan: VisitNotes,
        foto_wajah: PhotoFace,
        foto_identitas: PhotoIdentity,
        tanda_tangan: TandaTangan,
        tipe_kunjungan: VisitType || "personal",
        jumlah_tamu: GuestCount ? Number(GuestCount) : 1,
        kode_kunjungan: VisitCode,
        token_qr: QRToken,
        waktu_masuk: CheckInTime,
        status: "Rencana",
        status_persetujuan: initialStatusPersetujuan,
        created_at: formatDateSystem(),
      };

      const [idKunjungan] = await DB("trs_kunjungan").insert(oData);

      // Simpan anggota rombongan jika ada
      let parsedGroupMembers = [];
      if (GroupMembers && GroupMembers !== "") {
        try {
          parsedGroupMembers = JSON.parse(GroupMembers);
        } catch (err) {
          console.error("Gagal parsing GroupMembers:", err);
        }
      }

      if (VisitType === "group" && Array.isArray(parsedGroupMembers) && parsedGroupMembers.length > 0) {
        const insertPromises = parsedGroupMembers.map(async (member, index) => {
          const memberFile = getFile(`MemberIdentityFile_${index}`);
          let memberPhotoPath = null;
          if (memberFile) {
            memberPhotoPath = await uploadFileToMinio(
              cBucket,
              memberFile,
              `${minioPrefix}/buku-tamu/foto/${nYear}/${cTodayPath}`
            );
          }

          await DB("trs_kunjungan_anggota").insert({
            id_kunjungan: idKunjungan,
            nama_anggota: member.name || member.nama_anggota || "",
            nomor_telepon: member.phone || member.nomor_telepon || null,
            nomor_identitas: member.idNumber || member.nomor_identitas || null,
            foto_identitas: memberPhotoPath,
            created_at: formatDateSystem(),
            updated_at: formatDateSystem()
          });
        });
        await Promise.all(insertPromises);
      }

      try {
        let purposeName = "Kunjungan";
        if (VisitPurposeId) {
          const purposeObj = await DB("mst_tujuan_kunjungan").where("id_tujuan_kunjungan", VisitPurposeId).first();
          if (purposeObj) {
            purposeName = purposeObj.nama_tujuan_kunjungan;
          }
        }

        let resolvedHostName = HostName || null;
        let oHost = null;
        if (resolvedHostUserId) {
          oHost = await DB("mst_pengguna")
            .select("nama_lengkap", "telepon")
            .where("id_pengguna", resolvedHostUserId)
            .first();
          if (oHost && oHost.nama_lengkap) {
            resolvedHostName = oHost.nama_lengkap;
          }
        }

        // --- 1. Kirim Notifikasi WA ke TAMU (Selalu Dikirim) ---
        const rawPhone = PhoneNumber || oPayload.PhoneNumber || oPayload.phone_number || oPayload.nomor_telepon || oPayload.nomor_hp;
        const GuestPhone = rawPhone ? String(rawPhone).replace(/[^0-9+]/g, '') : null;
        console.log(`[visit_registrasi] Target WA Tamu: ${GuestPhone}`);
        if (GuestPhone) {
          const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${VisitCode}`;
          const isApproved = initialStatusPersetujuan === "approved";
          const isRejected = initialStatusPersetujuan === "rejected";
          const statusText = isApproved ? "DISETUJUI" : isRejected ? "DITOLAK" : "MENUNGGU PERSETUJUAN";

          let waTamu = "";
          if (isRejected) {
            const hasNote = VisitNotes && String(VisitNotes).trim() !== '' && String(VisitNotes).trim() !== '-';
            const noteText = hasNote ? `\n\nAlasan / Catatan: ${VisitNotes}` : '';
            waTamu = `Halo Bpk/Ibu ${GuestName},

Mohon maaf, permohonan rencana kunjungan Anda dengan Kode Booking: *${VisitCode}* DITOLAK.${noteText}

Terima kasih.`;
          } else {
            waTamu = `Halo Bpk/Ibu ${GuestName},

Pendaftaran rencana kunjungan Anda berhasil dikonfirmasi.

Detail Kunjungan:
- Pegawai yang Ditemui: ${resolvedHostName || '-'}
- Status: ${statusText}
- Rencana Kedatangan: ${CheckInTime}
- Tujuan: ${purposeName}
${isApproved ? `\n📱 Link QR Code Tiket:\n${qrCodeImageUrl}\n` : ''}
${isApproved ? 'Silakan tunjukkan QR Code di atas kepada petugas resepsionis saat Anda tiba di lokasi.' : 'Notifikasi konfirmasi akan dikirimkan kembali setelah permohonan disetujui.'} Terima kasih.`;
          }

          await sendWhatsAppMessage(GuestPhone, waTamu, isApproved ? qrCodeImageUrl : null);
        }

        // --- 2. Kirim Notifikasi Email & WA ke PEGAWAI / HOST (Jika ada) ---
        if (resolvedHostUserId) {
          sendMailNotification(resolvedHostUserId, "booking", {
            nama_tamu: GuestName,
            instansi_tamu: GuestCompany || "-",
            VisitPurposeName: purposeName,
            waktu_masuk: CheckInTime,
            kode_kunjungan: VisitCode,
            catatan_kunjungan: VisitNotes || "-"
          });

          const oHost = await DB("mst_pengguna").select("nama_lengkap", "telepon").where("id_pengguna", resolvedHostUserId).first();
          if (oHost && oHost.telepon) {
            let openingMsg = "Ada tamu yang telah mendaftarkan rencana kunjungan kepada Anda";
            let closingMsg = "Silakan bersiap untuk menerima tamu tersebut pada jadwal yang ditentukan.";

            const lowerPurpose = (purposeName || "").toLowerCase();

            if (lowerPurpose.includes("meeting")) {
              openingMsg = "Ada tamu yang menjadwalkan sesi Meeting dengan Anda";
              closingMsg = "Silakan persiapkan ruangan dan jadwal Anda.";
            } else if (lowerPurpose.includes("interview") || lowerPurpose.includes("wawancara")) {
              openingMsg = "Seorang kandidat telah mendaftar untuk sesi Interview/Wawancara dengan Anda";
            }

            const waHost = `Halo Bpk/Ibu ${oHost.nama_lengkap},

${openingMsg}.

Data Rencana Kunjungan:
- Nama Tamu: ${GuestName}
- No. WA Tamu: ${GuestPhone}
- Instansi: ${GuestCompany || '-'}
- Waktu Kedatangan: ${CheckInTime}
- Keperluan: ${purposeName}
- Catatan: ${VisitNotes || '-'}

${closingMsg}`;
            await sendWhatsAppMessage(oHost.telepon, waHost);
          }
        }
      } catch (e) {
        Logging(e, {
          file: "visit_registrasi.js",
          func: "notify",
          request: { HostUserId },
          response: "notify failed",
          user: nama_pengguna,
        });
      }

      return res.status(200).json({
        status: "00",
        message: "Registrasi berhasil",
        data: {
          kode_kunjungan: VisitCode,
          token_qr: QRToken,
          id_kunjungan: idKunjungan,
          nama_tamu: GuestName,
          instansi_tamu: GuestCompany || "-",
          qr_image_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${QRToken}`,
        },
        datetime: formatDateSystem(),
      });
    } catch (error) {
      const oResult = {
        status: "01",
        message: "Sistem sedang maintenance harap tunggu sebentar",
        datetime: formatDateSystem(),
      };
      Logging(error, {
        file: "visit_registrasi.js",
        func: "registrasi",
        request: req.body,
        response: oResult,
        user: nama_pengguna,
      });
      return res.status(500).json(oResult);
    }
  },
);

export default router;
