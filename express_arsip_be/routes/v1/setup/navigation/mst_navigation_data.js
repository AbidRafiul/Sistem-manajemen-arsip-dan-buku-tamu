import express from "express";
import DB from "../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import Joi from "joi";
import { normalizeLegacyMenu, roleAliases } from "./navigation_helper.js";

const router = express.Router();

const uniqueValues = (values) => {
  return Array.from(
    new Set(
      values
        .flat()
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
};

const getRoleById = async (roleId) => {
  if (!roleId) return null;

  return await DB("mst_roles")
    .select("role_name", "role_code")
    .where("role_id", roleId)
    .orWhere("RoleId", roleId)
    .first()
    .catch(() => null);
};

const getRoleByUserId = async (userId) => {
  if (!userId) return null;

  return await DB("mst_user_roles")
    .leftJoin("mst_roles", "mst_user_roles.role_id", "mst_roles.role_id")
    .select(
      "mst_roles.role_name as role_name",
      "mst_roles.role_code as role_code",
    )
    .where("mst_user_roles.id_pengguna", userId)
    .where((builder) => {
      builder
        .where("mst_user_roles.status", "active")
        .orWhereNull("mst_user_roles.status");
    })
    .orderBy("mst_user_roles.is_primary", "desc")
    .first()
    .catch(() => null);
};

const getNavigationByRole = async (roles) => {
  const aliases = uniqueValues(roles.map((role) => roleAliases(role)));

  if (!aliases.length) return null;

  return await DB("mst_navigation")
    .select("menu", "role")
    .whereIn("role", aliases)
    .orderByRaw(`CASE WHEN role = ? THEN 0 ELSE 1 END`, [roles[0] || ""])
    .first();
};

const queryNavigationByRoleId = async (roleId) => {
    const tableName = (await DB.schema.hasTable("mst_navigasi"))
        ? "mst_navigasi"
        : (await DB.schema.hasTable("mst_navigation"))
            ? "mst_navigation"
            : null;

    if (!tableName) return null;

    const [columns] = await DB.raw("SHOW COLUMNS FROM ??", [tableName]);
    const columnNames = columns.map((column) => column.Field);
    const menuColumn = columnNames.includes("menu") ? "menu" : columnNames.includes("Menu") ? "Menu" : null;
    const roleColumn = columnNames.includes("peran") ? "peran" : columnNames.includes("role") ? "role" : null;

    if (!menuColumn || !roleColumn) return null;

    return await DB(tableName)
      .select(`${menuColumn} as menu`)
      .where(roleColumn, roleId);
};

router.post("/", async (req, res) => {
  const { body } = req;
  const oPayload = body;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

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
        peran: Joi.number().required().label("peran"),
      },
      {
        "number.base": "{#label} harus berupa number",
        "number.empty": "{#label} tidak boleh kosong",
        "any.required": "{#label} wajib diisi",
      },
      oPayload,
      {},
    );

    if (cValidation) {
      const oResult = {
        status: status.BAD_REQUEST,
        message: cValidation || "Terdapat kesalahan pada data anda",
        datetime: datetime(),
      };

      Logging(null, {
        file: "mst_navigation_data.js",
        func: "get",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });

      return res.status(422).json(oResult);
    }

    const oData = await queryNavigationByRoleId(oPayload?.peran);

    if (!oData) {
      const oResult = {
        status: status.GAGAL,
        message: "Menu tidak ditemukan",
        datetime: datetime(),
      };

      Logging(null, {
        file: "mst_navigation_data.js",
        func: "get",
        request: oPayload,
        response: oResult,
        user: nama_pengguna,
      });

      return res.status(400).json(oResult);
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: oData,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    Logging(error, {
      file: "mst_navigation_data.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
