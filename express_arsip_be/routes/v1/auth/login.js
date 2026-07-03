import "dotenv/config";

import express from "express";
import Joi from "joi";
import { SignJWT } from "jose";
import DB from "../../../core/config/knex.js";
import {
  formatDateSystem,
  hashEquals,
  hmac,
  status,
} from "../components/tools/general.js";
import { Logging, validatePayload } from "../components/tools/servertool.js";
import { recordAuditTrail } from "../components/tools/audit_tool.js";

const router = express.Router();

const getColumns = async (tableName) => {
  const [columns] = await DB.raw("SHOW COLUMNS FROM ??", [tableName]);
  return columns.map((column) => column.Field);
};

const pickColumn = (columns, candidates) => {
  return candidates.find((candidate) => columns.includes(candidate));
};

const getUserByUsername = async (namaPengguna) => {
  const columns = await getColumns("mst_pengguna");
  const idColumn = pickColumn(columns, [
    "id_pengguna",
    "user_id",
    "UserId",
  ]);
  const usernameColumn = pickColumn(columns, [
    "nama_pengguna",
    "username",
    "Username",
  ]);
  const passwordColumn = pickColumn(columns, [
    "kata_sandi",
    "password",
    "Password",
  ]);
  const fullnameColumn = pickColumn(columns, [
    "nama_lengkap",
    "fullname",
    "Fullname",
  ]);
  const statusColumn = pickColumn(columns, ["status", "Status"]);

  if (!idColumn || !usernameColumn || !passwordColumn) return null;

  return await DB("mst_pengguna")
    .where("nama_pengguna", namaPengguna)
    .select(
      "id_pengguna",
      "nama_pengguna",
      "kata_sandi",
      "nama_lengkap",
      "status",
    )
    .first();
};

const getUserRole = async (user) => {
  const oldTables = {
    userRole: "mst_pengguna_peran",
    role: "mst_peran",
    userId: "id_pengguna",
    roleId: "role_id",
    primary: "is_primary",
    roleCode: "role_code",
    roleName: "role_name",
  };
  const newTables = {
    userRole: "mst_pengguna_perans",
    role: "mst_perans",
    userId: "nama_pengguna",
    roleId: "id_peran",
    primary: "peran_utama",
    roleCode: "kode_peran",
    roleName: "nama_peran",
  };

  const hasOld = await DB.schema.hasTable(oldTables.userRole);
  const cfg = hasOld ? oldTables : newTables;
  if (
    !(await DB.schema.hasTable(cfg.userRole)) ||
    !(await DB.schema.hasTable(cfg.role))
  ) {
    return null;
  }

  const userRoleColumns = await getColumns(cfg.userRole);
  const roleColumns = await getColumns(cfg.role);
  const userJoinColumn = pickColumn(userRoleColumns, [
    cfg.userId,
    "id_pengguna",
    "user_id",
    "nama_pengguna",
  ]);
  const roleJoinColumn = pickColumn(userRoleColumns, [
    cfg.roleId,
    "id_peran",
    "role_id",
  ]);
  const roleIdColumn = pickColumn(roleColumns, [
    cfg.roleId,
    "id_peran",
    "role_id",
  ]);
  const roleCodeColumn = pickColumn(roleColumns, [
    cfg.roleCode,
    "kode_peran",
    "role_code",
  ]);
  const roleNameColumn = pickColumn(roleColumns, [
    cfg.roleName,
    "nama_peran",
    "role_name",
  ]);
  const primaryColumn = pickColumn(userRoleColumns, [
    cfg.primary,
    "peran_utama",
    "is_primary",
  ]);
  const statusColumn = pickColumn(userRoleColumns, ["status", "Status"]);

  if (!userJoinColumn || !roleJoinColumn || !roleIdColumn) return null;

  const userValue = ["nama_pengguna", "username"].includes(userJoinColumn)
    ? user.nama_pengguna
    : user.id_pengguna;

  const query = DB(`${cfg.userRole} as pengguna_peran`)
    .leftJoin(
      "mst_peran as peran",
      "pengguna_peran.id_peran",
      "peran.id_peran",
    )
    .select(
      "pengguna_peran.id_peran",
      "peran.kode_peran",
      "peran.nama_peran",
    )
    .where("pengguna_peran.id_pengguna", user.id_pengguna)
    .where((builder) => {
      builder
        .where("pengguna_peran.status", "active")
        .orWhereNull("pengguna_peran.status");
    })
    .orderBy("pengguna_peran.peran_utama", "desc")
    .first();

  return query;
};

router.post("/", async (req, res) => {
  const { body } = req;
  const cForwardedFor = req.headers["x-forwarded-for"];
  const cIp = cForwardedFor ? cForwardedFor.split(",")[0].trim() : "";
  let oPayload = body;

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
        nama_pengguna: Joi.string().required().label("nama_pengguna"),
        kata_sandi: Joi.string().required().label("kata_sandi"),
      },
      {
        "string.base": "{#label} harus berupa string",
        "string.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: formatDateSystem(),
      };

      Logging(null, {
        file: "login.js",
        func: "login",
        request: oPayload,
        response: oResult,
        user: oPayload?.nama_pengguna || "",
      });

      return res.status(422).json(oResult);
    }

    const oUser = await getUserByUsername(oPayload.nama_pengguna);

    if (!oUser) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "nama_pengguna tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    const secret = process.env.USER_SECRET;
    const cKataSandi =
      process.env.USER_KEY + oUser.nama_pengguna + oPayload.kata_sandi;

    if (!hashEquals(hmac(cKataSandi, secret, "sha512"), oUser.kata_sandi)) {
      return res.status(400).json({
        status: status.GAGAL,
        message: "kata_sandi salah",
        datetime: formatDateSystem(),
      });
    }

    if (oUser.status !== "active") {
      return res.status(400).json({
        status: status.GAGAL,
        message: "User belum aktif",
        datetime: formatDateSystem(),
      });
    }

    const oUserPeran = await getUserRole(oUser);
    const peranId = oUserPeran?.id_peran || null;
    const peran = oUserPeran?.nama_peran || null;
    const peranCode = oUserPeran?.kode_peran || null;

    const credential = {
      IdPengguna: oUser.id_pengguna,
      nama_pengguna: oUser.nama_pengguna,
      nama_lengkap: oUser.nama_lengkap,
      name: oUser.nama_lengkap,
      peranId,
      peran,
      peranCode,
      roleId: peranId,
      role: peran,
      roleCode: peranCode,
      ip_address: cIp,
    };

    const secretKey = new TextEncoder().encode(process.env.USER_KEY);
    const jwtCredential = await new SignJWT(credential)
      .setProtectedHeader({ alg: "HS512" })
      .sign(secretKey);

    await recordAuditTrail(
      oUser.nama_pengguna,
      String(peranId || ""),
      "LOGIN",
      req,
    );

    return res.status(200).json({
      status: status.SUKSES,
      message: "Login Berhasil",
      datetime: formatDateSystem(),
      credential: jwtCredential,
      data: credential,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "login.js",
      func: "login",
      request: oPayload,
      response: oResult,
      user: oPayload?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
