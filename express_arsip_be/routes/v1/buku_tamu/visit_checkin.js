import express from "express";
import multer from "multer";
import crypto from "crypto";
import Joi from "joi";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging, validatePayload, generateDailyVisitCode } from "../components/tools/servertool.js";
import DB from "../../../core/config/knex.js";
import { uploadFileToMinio, getMinioPrefix, MINIO_BUCKET_NAME } from "../../../core/components/tools/minio_helper.js";
import { sendMailNotification } from "../../../core/components/tools/mail_helper.js";
import { sendWhatsAppMessage } from "../../../core/components/tools/wa_helper.js";

const cBucket = MINIO_BUCKET_NAME;

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
            .max(255)
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
        VisitType,
        GuestCount,
        SignatureData,
        GroupMembers,
      } = oPayload;

      const getFile = (fieldname) => {
        return (req.files || []).find(f => f.fieldname === fieldname) || null;
      };

      const photoFaceFile = getFile("SelfieFile") || getFile("PhotoFace");
      const targetBranchId = oPayload.BranchId || oPayload.id_cabang || req.auth?.id_cabang || 1;
      const minioPrefix = await getMinioPrefix(targetBranchId);

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
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

      const now = new Date();
      const currentDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

      const cleanHostUserId = HostUserId && HostUserId !== "" && HostUserId !== "null" && HostUserId !== "undefined" ? HostUserId : null;
      const cleanVisitPurposeId = VisitPurposeId && VisitPurposeId !== "" ? Number(VisitPurposeId) : null;

      let resolvedHostUserId = cleanHostUserId;
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
        nama_tamu: GuestName || null,
        nomor_telepon: PhoneNumber || null,
        email_tamu: GuestEmail && GuestEmail !== "" ? GuestEmail : null,
        instansi_tamu: GuestCompany && GuestCompany !== "" ? GuestCompany : "-",
        jabatan_tamu: GuestPosition && GuestPosition !== "" ? GuestPosition : null,
        jenis_identitas: IdentityType && IdentityType !== "" ? IdentityType : null,
        nomor_identitas: IdentityNumber && IdentityNumber !== "" ? IdentityNumber : null,
        id_tujuan_kunjungan: cleanVisitPurposeId,
        id_user_host: resolvedHostUserId,
        nama_host: HostName && HostName !== "" ? HostName : null,
        catatan_kunjungan: VisitNotes && VisitNotes !== "" ? VisitNotes : null,
        foto_wajah: PhotoFace,
        foto_identitas: PhotoIdentity,
        tanda_tangan: TandaTangan,
        tipe_kunjungan: VisitType || "personal",
        jumlah_tamu: GuestCount ? Number(GuestCount) : 1,
        kode_kunjungan: VisitCode,
        token_qr: QRToken,
        waktu_masuk: currentDateTime,
        status: "in",
        status_persetujuan: "approved",
        created_at: currentDateTime,
        updated_at: currentDateTime
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
            created_at: currentDateTime,
            updated_at: currentDateTime
          });
        });
        await Promise.all(insertPromises);
      }

      // Kirim email notifikasi ke pegawai secara asinkron
      if (resolvedHostUserId) {
        const purpose = await DB("mst_tujuan_kunjungan").where("id_tujuan_kunjungan", cleanVisitPurposeId).first();
        const visitPurposeName = purpose ? purpose.nama_tujuan_kunjungan : "Kunjungan";

        sendMailNotification(resolvedHostUserId, "checkin", {
          nama_tamu: GuestName,
          instansi_tamu: GuestCompany || "-",
          VisitPurposeName: visitPurposeName,
          waktu_masuk: currentDateTime,
          kode_kunjungan: VisitCode,
          catatan_kunjungan: VisitNotes || "-"
        });

        // ==========================================
        // 5. KIRIM NOTIFIKASI WA KE HOST SECARA ASYNC
        // ==========================================
        try {
          const oHost = await DB("mst_pengguna")
            .select("nama_lengkap", "telepon")
            .where("id_pengguna", resolvedHostUserId)
            .first();

          if (oHost && oHost.telepon) {
            const waPesan = `Halo Bpk/Ibu ${oHost.nama_lengkap},\n\nAda tamu yang sedang menunggu Anda di Lobi.\n\nNama Tamu: ${GuestName}\nInstansi: ${GuestCompany || '-'}\nKeperluan: ${visitPurposeName || '-'}\nCatatan: ${VisitNotes || '-'}\n\nSilakan segera menemui tamu tersebut. Terima kasih.`;
            sendWhatsAppMessage(oHost.telepon, waPesan);
          }
        } catch (waErr) {
          console.error("[WA Gateway] Gagal memproses notifikasi:", waErr.message);
        }
      }

      return res.status(200).json({
        status: "00",
        message: "Check-in berhasil",
        data: {
          kode_kunjungan: VisitCode,
          token_qr: QRToken,
          id_kunjungan: idKunjungan,
          nama_tamu: GuestName,
          instansi_tamu: GuestCompany || "-",
          qr_image_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${QRToken}`
        },
        datetime: formatDateSystem(),
      });
    } catch (error) {
      console.error("❌ [Database Error Log]:", error);

      const oResult = {
        status: "01",
        message: "Sistem sedang maintenance harap tunggu sebentar",
        datetime: formatDateSystem(),
      };

      Logging(error, {
        file: "visit_checkin.js",
        func: "check-in",
        request: req.body,
        response: oResult,
        user: nama_pengguna,
      });

      return res.status(500).json(oResult);
    }
  },
);

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const { error } = Joi.number().integer().required().validate(id);
    if (error) {
      return res.status(400).json({ status: "99", message: "ID Kunjungan tidak valid", datetime: formatDateSystem() });
    }

    const checkKunjungan = await DB("trs_kunjungan").where("id_kunjungan", id).first();
    if (!checkKunjungan) {
      return res.status(404).json({ status: "01", message: "Data kunjungan tidak ditemukan", datetime: formatDateSystem() });
    }

    if (checkKunjungan.status_persetujuan !== "approved") {
      return res.status(400).json({ status: "01", message: "Kunjungan belum disetujui", datetime: formatDateSystem() });
    }

    if (checkKunjungan.status === "in") {
      return res.status(400).json({ status: "01", message: "Tamu sudah berstatus check-in", datetime: formatDateSystem() });
    }

    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

    await DB("trs_kunjungan")
      .where("id_kunjungan", id)
      .update({
        status: "in",
        waktu_masuk: currentDateTime,
        updated_at: currentDateTime
      });

    // Kirim email notifikasi ke pegawai secara asinkron
    if (checkKunjungan.id_user_host) {
      const purpose = await DB("mst_tujuan_kunjungan").where("id_tujuan_kunjungan", checkKunjungan.id_tujuan_kunjungan).first();
      const visitPurposeName = purpose ? purpose.nama_tujuan_kunjungan : "Kunjungan";

      sendMailNotification(checkKunjungan.id_user_host, "checkin", {
        nama_tamu: checkKunjungan.nama_tamu,
        instansi_tamu: checkKunjungan.instansi_tamu || "-",
        VisitPurposeName: visitPurposeName,
        waktu_masuk: currentDateTime,
        kode_kunjungan: checkKunjungan.kode_kunjungan,
        catatan_kunjungan: checkKunjungan.catatan_kunjungan || "-"
      });
    }

    return res.status(200).json({
      status: "00",
      message: `Tamu ${checkKunjungan.nama_tamu} berhasil Check-in`,
      datetime: formatDateSystem()
    });

  } catch (error) {
    console.error("❌ [Database Error Log visit_checkin.js PUT]:", error);
    const oResult = { status: "01", message: "Sistem error saat check-in tamu", datetime: formatDateSystem() };
    Logging(error, { file: "visit_checkin.js", func: "check-in-put", request: req.params, response: oResult, user: nama_pengguna });
    return res.status(500).json(oResult);
  }
});

export default router;
