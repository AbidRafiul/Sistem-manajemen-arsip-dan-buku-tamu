import express from "express";
import {
  datetime,
  formatDateSystem,
  hmac,
  status,
} from "../../components/tools/general.js";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: oPayload } = req;
  const username = req?.auth?.username || "";

  try {
    if (!oPayload || Object.keys(oPayload).length < 1) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Invalid request body",
        datetime: formatDateSystem(),
      });
    }

    const cValidation = await validatePayload(
      {
        fullname: Joi.string().max(100).required().label("fullname"),
        username: Joi.string().max(100).required().label("username"),
        telp: Joi.string()
          .pattern(/^[0-9]+$/)
          .max(13)
          .required()
          .label("telp"),
        role: Joi.alternatives()
          .try(Joi.string(), Joi.number())
          .required()
          .label("role"),
        password: Joi.string()
          .min(8)
          .pattern(
            new RegExp(
              "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$",
            ),
          )
          .required()
          .label("password"),
        status: Joi.string().required().label("status"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
      {
        uniqueField: ["username", "telp"],
        table: "mst_users", // Validasi langsung cek ke mst_users
        allowUnknown: true,
      },
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: datetime(),
      };
      Logging(null, {
        file: "user_create.js",
        func: "create",
        request: oPayload,
        response: oResult,
        user: username,
      });
      return res.status(422).json(oResult);
    }

    // HASH PASSWORD PAKAI USERNAME SEBAGAI SALT
    let hashedPassword = "";
    if (oPayload.password) {
      const cPassword =
        process.env.USER_KEY + oPayload.username + oPayload.password;
      const secret = process.env.USER_SECRET;
      hashedPassword = hmac(cPassword, secret, "sha512");
    }

    // 1. SIAPKAN INPUT ROLE (Menangani superadmin ke master)
    let inputRole = oPayload.role;
    if (inputRole == "superadmin" || inputRole == "admin") {
      inputRole = "master";
    }

    // 2. CARI ROLE DATA TERLEBIH DAHULU SEBELUM TRANSAKSI
    // Mencari berdasarkan ID (angka) atau RoleName (string)
    const roleData = await DB("mst_roles")
      .where("role_id", inputRole)
      .orWhere("role_name", inputRole)
      .first();

    if (!roleData) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "Role tidak ditemukan di sistem",
        datetime: formatDateSystem()
      });
    }

    // 3. CARI NAVIGASI
    // Karena roleData sudah ketemu, kita pasti bisa mengambil RoleName-nya
    const oNavigation = await DB("mst_navigation")
      .select("menu")
      .where("role", roleData.role_name)
      .first();

    // 4. VALIDASI NAVIGASI
    if (!oNavigation || !oNavigation.menu) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "Role tidak memiliki template menu di mst_navigation",
        datetime: formatDateSystem(),
      });
    }

    // 5. TRANSAKSI DATABASE KE 3 TABEL
    await DB.transaction(async (trx) => {
      // Masuk ke mst_users (Buku Induk)
      const [newUserId] = await trx("mst_users").insert({
        fullname: oPayload.fullname,
        username: oPayload.username,
        telp: oPayload.telp,
        password: hashedPassword,
        status: (oPayload.status == "1" || oPayload.status == "active") ? "active" : "nonactive",
        branch_id: oPayload.branch_id,
        position_id: oPayload.position_id,
        division_id: oPayload.division_id,
        department_id: oPayload.department_id,
        work_unit_id: oPayload.work_unit_id,
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      });

      // Masuk ke mst_user_roles (Relasi Jabatan)
      // Pakai roleData.role_id dari pencarian di atas
      await trx("mst_user_roles").insert({
        user_id: newUserId,
        role_id: roleData.role_id, 
      });

      // Masuk ke user_navigation (Nampan Menu Spesifik)
      // Pakai oNavigation.menu dari pencarian di atas
      await trx("user_navigation").insert({
        user_id: newUserId,
        menu: oNavigation.menu,
        created_at: formatDateSystem(),
        updated_at: formatDateSystem(),
      });
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil dibuat di sistem baru",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance",
      datetime: datetime(),
    };
    Logging(error, {
      file: "user_create.js",
      func: "create",
      request: oPayload,
      response: oResult,
      user: username,
    });
    return res.status(500).json(oResult);
  }
});

export default router;