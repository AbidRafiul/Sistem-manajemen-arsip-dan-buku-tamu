import express from "express";
import multer from "multer";
import crypto from "crypto";
import Joi from "joi";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging, validatePayload } from "../components/tools/servertool.js"; // 💡 Menghapus getLastFaktur karena diganti generator dinamis
import DB from "../../../core/config/knex.js";
import { uploadFileToMinio } from "../../../core/components/tools/minio_helper.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  upload.fields([
    { name: "PhotoFace", maxCount: 1 },
    { name: "photoFace", maxCount: 1 },
    { name: "PhotoIdentity", maxCount: 1 },
    { name: "photoIdentity", maxCount: 1 },
  ]),
  async (req, res) => {
    const { body: oPayload } = req;
    const username = req?.auth?.username || "";

    try {
      const cValidation = await validatePayload(
        {
          GuestName: Joi.string().max(100).required().label("GuestName"),
          PhoneNumber: Joi.string().max(45).required().label("PhoneNumber"),
          GuestEmail: Joi.string().email().max(150).optional().allow(null, "").label("GuestEmail"),
          GuestCompany: Joi.string().max(255).optional().allow(null, "").label("GuestCompany"),
          GuestPosition: Joi.string().max(20).optional().allow(null, "").label("GuestPosition"),
          VisitPurposeId: Joi.alternatives().try(Joi.string(), Joi.number()).required().label("VisitPurposeId"),
          HostUserId: Joi.string().max(36).optional().allow(null, "").label("HostUserId"),
          HostName: Joi.string().max(100).optional().allow(null, "").label("HostName"),
          IdentityType: Joi.string().valid("ktp", "sim", "paspor").optional().allow(null, "").label("IdentityType"),
          IdentityNumber: Joi.string().max(50).optional().allow(null, "").label("IdentityNumber"),
          VisitNotes: Joi.string().optional().allow(null, "").label("VisitNotes"),
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
        { allowUnknown: true }
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
      } = oPayload;

      const photoFaceFile = req.files?.PhotoFace?.[0] || req.files?.photoFace?.[0] || null;
      const photoIdentityFile = req.files?.PhotoIdentity?.[0] || req.files?.photoIdentity?.[0] || null;
      const todayPath = formatDateSystem(new Date(), "yyyyMMdd");

      let PhotoFace = null;
      let PhotoIdentity = null;

      if (photoFaceFile) {
        PhotoFace = await uploadFileToMinio(
          "buku-tamu",
          photoFaceFile,
          `photos/${todayPath}`
        );
      }

      if (photoIdentityFile) {
        PhotoIdentity = await uploadFileToMinio(
          "buku-tamu",
          photoIdentityFile,
          `photos/${todayPath}`
        );
      }

      // 🎯 FIX GENERATOR DINAMIS: Membuat kode unik otomatis berbasis penanggalan milidetik
      const dateStr = formatDateSystem(new Date(), "yyyyMMdd"); // Hasil: 20260611
      const uniqueSuffix = Date.now().toString().slice(-4); // Mengambil 4 digit milidetik terakhir riil
      const VisitCode = `TAMU${dateStr}${uniqueSuffix}`; // Hasil: TAMU202606115932 (Anti-Duplikat!)

      const QRToken =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

      const oData = {
        GuestName,
        PhoneNumber,
        GuestEmail,
        GuestCompany,
        GuestPosition,
        IdentityType,
        IdentityNumber,
        VisitPurposeId,
        HostUserId,
        HostName,
        VisitNotes,
        PhotoFace,
        PhotoIdentity,
        VisitCode,
        QRToken,
        CheckInTime: formatDateSystem(),
        Status: "in",
        ApprovalStatus: "approved",
        CreatedAt: formatDateSystem(),
      };

      const [VisitationId] = await DB("trx_visitations").insert(oData);

      return res.status(200).json({
        status: "00",
        message: "Check-in berhasil",
        data: {
          VisitCode,
          QRToken,
          VisitationId,
        },
        datetime: formatDateSystem(),
      });
    } catch (error) {
      // Mengirimkan log pesan error riil dari MySQL ke konsol terminal untuk mempermudah audit kalian
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
        user: username,
      });

      return res.status(500).json(oResult);
    }
  }
);

export default router;