import express from "express";
import multer from "multer";
import crypto from "crypto";
import Joi from "joi";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging, validatePayload } from "../components/tools/servertool.js";
import DB from "../../../core/config/knex.js";
import { uploadFileToMinio } from "../../../core/components/tools/minio_helper.js";
import { sendMailNotification } from "../../../core/components/tools/mail_helper.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  upload.fields([
    { name: "SelfieFile", maxCount: 1 },
    { name: "IdentityFile", maxCount: 1 },
    { name: "PhotoFace", maxCount: 1 },
    { name: "PhotoIdentity", maxCount: 1 },
    { name: "SignatureFile", maxCount: 1 },
  ]),
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
      } = oPayload;

      const photoFaceFile =
        req.files?.SelfieFile?.[0] || req.files?.PhotoFace?.[0] || null;
      const photoIdentityFile =
        req.files?.IdentityFile?.[0] || req.files?.PhotoIdentity?.[0] || null;
      const signatureFile = req.files?.SignatureFile?.[0] || null;
      const todayPath = formatDateSystem(new Date(), "yyyyMMdd");

      let PhotoFace = null;
      let PhotoIdentity = null;
      let TandaTangan = null;

      const cBucket = process.env.MINIO_BUCKET_NAME || "arsip-bucket";

      if (photoFaceFile) {
        PhotoFace = await uploadFileToMinio(
          cBucket,
          photoFaceFile,
          `buku_tamu/photos/${todayPath}`,
        );
      }

      if (photoIdentityFile) {
        PhotoIdentity = await uploadFileToMinio(
          cBucket,
          photoIdentityFile,
          `buku_tamu/photos/${todayPath}`,
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
            `buku_tamu/signatures/${todayPath}`,
          );
        }
      } else if (signatureFile) {
        TandaTangan = await uploadFileToMinio(
          cBucket,
          signatureFile,
          `buku_tamu/signatures/${todayPath}`,
        );
      }

      const dateStr = formatDateSystem(new Date(), "yyyyMMdd");
      const uniqueSuffix = Date.now().toString().slice(-4);
      const VisitCode = `TAMU${dateStr}${uniqueSuffix}`;

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
