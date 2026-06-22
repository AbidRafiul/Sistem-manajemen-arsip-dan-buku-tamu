import express from "express";
import multer from "multer";
import crypto from "crypto";
import Joi from "joi";
import { formatDateSystem } from "../components/tools/general.js";
import { Logging, validatePayload } from "../components/tools/servertool.js"; 
import DB from "../../../core/config/knex.js";
import { uploadFileToMinio } from "../../../core/components/tools/minio_helper.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  upload.fields([
    { name: "SelfieFile", maxCount: 1 },
    { name: "IdentityFile", maxCount: 1 },
    { name: "PhotoFace", maxCount: 1 },
    { name: "PhotoIdentity", maxCount: 1 }
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

      const photoFaceFile = req.files?.SelfieFile?.[0] || req.files?.PhotoFace?.[0] || null;
      const photoIdentityFile = req.files?.IdentityFile?.[0] || req.files?.PhotoIdentity?.[0] || null;
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

      const dateStr = formatDateSystem(new Date(), "yyyyMMdd"); 
      const uniqueSuffix = Date.now().toString().slice(-4); 
      const VisitCode = `TAMU${dateStr}${uniqueSuffix}`;

      const QRToken =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

      const oData = {
        guest_name: GuestName,
        phone_number: PhoneNumber,
        guest_email: GuestEmail,
        guest_company: GuestCompany,
        guest_position: GuestPosition,
        identity_type: IdentityType,
        identity_number: IdentityNumber,
        visit_purpose_id: VisitPurposeId,
        host_user_id: HostUserId,
        host_name: HostName,
        visit_notes: VisitNotes,
        photo_face: PhotoFace,
        photo_identity: PhotoIdentity,
        visit_code: VisitCode,
        qr_token: QRToken,
        check_in_time: formatDateSystem(),
        status: "Sedang Berkunjung",
        approval_status: "approved",
        created_at: formatDateSystem(),
      };

      const [VisitationId] = await DB("trx_visitations").insert(oData);

      return res.status(200).json({
        status: "00",
        message: "Check-in berhasil",
        data: {
          visit_code: VisitCode,
          qr_token: QRToken,
          visitation_id: VisitationId,
          guest_name: GuestName,
          guest_company: GuestCompany || "-",
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
        user: username,
      });

      return res.status(500).json(oResult);
    }
  }
);

export default router;