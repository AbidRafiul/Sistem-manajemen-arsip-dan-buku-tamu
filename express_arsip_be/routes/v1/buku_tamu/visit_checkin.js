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
          nama_tamu: Joi.string().max(100).required().label("nama_tamu"),
          nomor_telepon: Joi.string().max(45).required().label("nomor_telepon"),
          email_tamu: Joi.string()
            .email()
            .max(150)
            .optional()
            .allow(null, "")
            .label("email_tamu"),
          instansi_tamu: Joi.string()
            .max(255)
            .optional()
            .allow(null, "")
            .label("instansi_tamu"),
          jabatan_tamu: Joi.string()
            .max(20)
            .optional()
            .allow(null, "")
            .label("jabatan_tamu"),
          id_tujuan_kunjungan: Joi.alternatives()
            .try(Joi.string(), Joi.number())
            .required()
            .label("id_tujuan_kunjungan"),
          id_user_host: Joi.string()
            .max(36)
            .optional()
            .allow(null, "")
            .label("id_user_host"),
          nama_host: Joi.string()
            .max(100)
            .optional()
            .allow(null, "")
            .label("nama_host"),
          jenis_identitas: Joi.string()
            .valid("ktp", "sim", "paspor")
            .optional()
            .allow(null, "")
            .label("jenis_identitas"),
          nomor_identitas: Joi.string()
            .max(50)
            .optional()
            .allow(null, "")
            .label("nomor_identitas"),
          catatan_kunjungan: Joi.string()
            .optional()
            .allow(null, "")
            .label("catatan_kunjungan"),
          tipe_kunjungan: Joi.string()
            .valid("personal", "group")
            .optional()
            .allow(null, "")
            .label("tipe_kunjungan"),
          jumlah_tamu: Joi.number()
            .integer()
            .min(1)
            .optional()
            .allow(null, "")
            .label("jumlah_tamu"),
          tanda_tangan_data: Joi.string()
            .optional()
            .allow(null, "")
            .label("tanda_tangan_data"),
          anggota_rombongan: Joi.string()
            .optional()
            .allow(null, "")
            .label("anggota_rombongan"),
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
        nama_tamu,
        nomor_telepon,
        email_tamu,
        instansi_tamu,
        jabatan_tamu,
        id_tujuan_kunjungan,
        id_user_host,
        nama_host,
        jenis_identitas,
        nomor_identitas,
        catatan_kunjungan,
        tipe_kunjungan,
        jumlah_tamu,
        tanda_tangan_data,
        anggota_rombongan,
      } = oPayload;

      const getFile = (fieldname) => {
        return (req.files || []).find(f => f.fieldname === fieldname) || null;
      };

      const photoFaceFile = getFile("foto_wajah") || getFile("SelfieFile");
      const targetBranchId = oPayload.id_cabang || req.auth?.id_cabang || 1;
      const minioPrefix = await getMinioPrefix(targetBranchId);

      const photoIdentityFile = getFile("foto_identitas") || getFile("IdentityFile");
      const signatureFile = getFile("file_tanda_tangan") || getFile("SignatureFile");
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

      if (tanda_tangan_data && tanda_tangan_data.startsWith("data:image/")) {
        const matches = tanda_tangan_data.match(new RegExp("^data:([A-Za-z-+/]+);base64,(.+)$"));
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
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

      const currentDateTime = formatDateSystem(new Date(), "yyyy-MM-dd HH:mm:ss", "WIB");

      const cleanHostUserId = id_user_host && id_user_host !== "" && id_user_host !== "null" && id_user_host !== "undefined" ? id_user_host : null;
      const cleanVisitPurposeId = id_tujuan_kunjungan && id_tujuan_kunjungan !== "" ? Number(id_tujuan_kunjungan) : null;

      let resolvedHostUserId = cleanHostUserId;
      if (!resolvedHostUserId && nama_host) {
        const matchedUser = await DB("mst_pengguna")
          .where("nama_lengkap", nama_host)
          .orWhere("nama_pengguna", nama_host)
          .orWhere("surel", nama_host)
          .first();
        if (matchedUser) {
          resolvedHostUserId = matchedUser.id_pengguna;
        }
      }

      const oData = {
        id_cabang: targetBranchId,
        nama_tamu: nama_tamu || null,
        nomor_telepon: nomor_telepon || null,
        email_tamu: email_tamu && email_tamu !== "" ? email_tamu : null,
        instansi_tamu: instansi_tamu && instansi_tamu !== "" ? instansi_tamu : "-",
        jabatan_tamu: jabatan_tamu && jabatan_tamu !== "" ? jabatan_tamu : null,
        jenis_identitas: jenis_identitas && jenis_identitas !== "" ? String(jenis_identitas).toLowerCase() : null,
        nomor_identitas: nomor_identitas && nomor_identitas !== "" ? nomor_identitas : null,
        id_tujuan_kunjungan: cleanVisitPurposeId,
        id_user_host: resolvedHostUserId,
        nama_host: nama_host && nama_host !== "" ? nama_host : null,
        catatan_kunjungan: catatan_kunjungan && catatan_kunjungan !== "" ? catatan_kunjungan : null,
        foto_wajah: PhotoFace,
        foto_identitas: PhotoIdentity,
        tanda_tangan: TandaTangan,
        tipe_kunjungan: tipe_kunjungan || "personal",
        jumlah_tamu: jumlah_tamu ? Number(jumlah_tamu) : 1,
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
      if (anggota_rombongan && anggota_rombongan !== "") {
        try {
          parsedGroupMembers = JSON.parse(anggota_rombongan);
        } catch (err) {
          console.error("Gagal parsing anggota_rombongan:", err);
        }
      }

      if (tipe_kunjungan === "group" && Array.isArray(parsedGroupMembers) && parsedGroupMembers.length > 0) {
        const insertPromises = parsedGroupMembers.map(async (member, index) => {
          const memberFile = getFile(`foto_identitas_anggota_${index}`) || getFile(`MemberIdentityFile_${index}`);
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
          nama_tamu: nama_tamu,
          instansi_tamu: instansi_tamu || "-",
          VisitPurposeName: visitPurposeName,
          waktu_masuk: currentDateTime,
          kode_kunjungan: VisitCode,
          catatan_kunjungan: catatan_kunjungan || "-"
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
            let openingMsg = "Ada tamu yang sedang menunggu Anda di Lobi";
            let closingMsg = "Silakan segera menemui tamu tersebut. Terima kasih.";

            const lowerPurpose = (visitPurposeName || "").toLowerCase();

            if (lowerPurpose.includes("meeting")) {
              openingMsg = "Ada tamu untuk jadwal Meeting yang sedang menunggu Anda di Lobi";
              closingMsg = "Silakan persiapkan ruangan dan segera menemui tamu tersebut. Terima kasih.";
            } else if (lowerPurpose.includes("pengiriman")) {
              openingMsg = "Ada kurir/pengirim barang yang menunggu Anda di Lobi";
              closingMsg = "Silakan segera menuju lobi untuk menerima kiriman tersebut. Terima kasih.";
            } else if (lowerPurpose.includes("interview") || lowerPurpose.includes("wawancara")) {
              openingMsg = "Kandidat untuk sesi Interview/Wawancara telah hadir di Lobi";
              closingMsg = "Silakan segera menemui kandidat atau mengarahkannya ke ruangan yang telah disiapkan. Terima kasih.";
            } else if (lowerPurpose.includes("perbaikan") || lowerPurpose.includes("maintenance")) {
              openingMsg = "Tim perbaikan/maintenance telah tiba di Lobi";
              closingMsg = "Silakan temui dan arahkan tim ke lokasi perbaikan. Terima kasih.";
            } else if (lowerPurpose.includes("audit") || lowerPurpose.includes("pemeriksaan")) {
              openingMsg = "Tim audit/pemeriksaan telah hadir di Lobi";
              closingMsg = "Silakan segera menyambut tim audit. Terima kasih.";
            } else if (lowerPurpose.includes("konsultasi")) {
              openingMsg = "Ada tamu untuk sesi Konsultasi yang sedang menunggu Anda di Lobi";
              closingMsg = "Silakan segera menemui tamu tersebut. Terima kasih.";
            }

            const waPesan = `Halo Bpk/Ibu ${oHost.nama_lengkap},

${openingMsg} pada waktu ${formatDateSystem()}.

Data Tamu:
- Nama Tamu: ${nama_tamu}
- No. WA Tamu: ${nomor_telepon}
- Instansi: ${instansi_tamu || '-'}
- Keperluan: ${visitPurposeName || '-'}
- Catatan: ${catatan_kunjungan || '-'}

${closingMsg}`;
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
          nama_tamu: nama_tamu,
          instansi_tamu: instansi_tamu || "-",
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

    const currentDateTime = formatDateSystem(new Date(), "yyyy-MM-dd HH:mm:ss", "WIB");

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
