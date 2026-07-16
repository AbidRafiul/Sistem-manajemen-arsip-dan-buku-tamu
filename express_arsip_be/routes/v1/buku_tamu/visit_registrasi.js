import express from "express";
import multer from "multer";
import Joi from "joi";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging, validatePayload, generateDailyVisitCode } from "../components/tools/servertool.js";
import DB from "../../../core/config/knex.js";
import { uploadFileToMinio, getMinioPrefix, MINIO_BUCKET_NAME } from "../../../core/components/tools/minio_helper.js";
import { sendMailNotification } from "../../../core/components/tools/mail_helper.js";

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
        Logging(null, {
          file: "visit_registrasi.js",
          func: "registrasi",
          request: oPayload,
          response: oResult,
          user: nama_pengguna,
        });
        return res.status(422).json(oResult);
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

      const targetBranchId = oPayload.BranchId || oPayload.id_cabang || req.auth?.id_cabang || 1;
      const minioPrefix = await getMinioPrefix(targetBranchId);

      const getFile = (fieldname) => {
        return (req.files || []).find(f => f.fieldname === fieldname) || null;
      };

      const photoFaceFile = getFile("SelfieFile") || getFile("PhotoFace");
      const photoIdentityFile = getFile("IdentityFile") || getFile("PhotoIdentity");
      const signatureFile = getFile("SignatureFile");
      const todayPath = formatDateSystem(new Date(), "yyyyMMdd");

      let PhotoFace = null;
      let PhotoIdentity = null;
      let TandaTangan = null;

      if (photoFaceFile) {
        PhotoFace = await uploadFileToMinio(
          cBucket,
          photoFaceFile,
          `${minioPrefix}/buku-tamu/photos/${todayPath}`,
        );
      }
      if (photoIdentityFile) {
        PhotoIdentity = await uploadFileToMinio(
          cBucket,
          photoIdentityFile,
          `${minioPrefix}/buku-tamu/photos/${todayPath}`,
        );
      }

      if (SignatureData && SignatureData.startsWith("data:image/")) {
        const matches = SignatureData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
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
            `${minioPrefix}/buku-tamu/signatures/${todayPath}`,
          );
        }
      } else if (signatureFile) {
        TandaTangan = await uploadFileToMinio(
          cBucket,
          signatureFile,
          `${minioPrefix}/buku-tamu/signatures/${todayPath}`,
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

      const oData = {
        id_cabang: targetBranchId,
        nama_tamu: GuestName,
        nomor_telepon: PhoneNumber,
        email_tamu: GuestEmail,
        instansi_tamu: GuestCompany,
        jabatan_tamu: GuestPosition,
        jenis_identitas: IdentityType,
        nomor_identitas: IdentityNumber,
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
        status_persetujuan: "pending",
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
              "buku-tamu",
              memberFile,
              `${minioPrefix}/buku-tamu/photos/${todayPath}`
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
        if (resolvedHostUserId) {
          // NOTIFIKASI DI WEB DINONAKTIFKAN (KARENA FITUR LONCENG DI FRONTEND MASIH TEMPLATE STATIS)
          /*
          await DB("notifications").insert({
            id_pengguna: resolvedHostUserId,
            title: "Booking Tamu",
            body: `Anda memiliki booking tamu dari ${GuestName}`,
            data: JSON.stringify({
              id_kunjungan: idKunjungan,
              kode_kunjungan: VisitCode,
            }),
            created_at: formatDateSystem(),
          });
          */

          // Kirim email notifikasi booking baru ke pegawai secara asinkron
          let purposeName = "Kunjungan";
          if (VisitPurposeId) {
            const purposeObj = await DB("mst_tujuan_kunjungan").where("id_tujuan_kunjungan", VisitPurposeId).first();
            if (purposeObj) {
              purposeName = purposeObj.nama_tujuan_kunjungan;
            }
          }

          sendMailNotification(resolvedHostUserId, "booking", {
            nama_tamu: GuestName,
            instansi_tamu: GuestCompany || "-",
            VisitPurposeName: purposeName,
            waktu_masuk: CheckInTime,
            kode_kunjungan: VisitCode,
            catatan_kunjungan: VisitNotes || "-"
          });
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
