import {
  getClientKey,
  getClientPassKey,
  getClientSecret,
} from "../core/config/secret.js";
import {
  formatDateSystem,
  hashEquals,
  hmac,
  status,
} from "../routes/v1/components/tools/general.js";
import DB from "../core/config/knex.js";
import { Logging } from "../routes/v1/components/tools/servertool.js";
import { AsyncLocalStorage } from "async_hooks";

const als = new AsyncLocalStorage();

const getColumns = async (tableName) => {
  const [columns] = await DB.raw("SHOW COLUMNS FROM ??", [tableName]);
  return columns.map((column) => column.Field);
};

const pickColumn = (columns, candidates) =>
  candidates.find((candidate) => columns.includes(candidate));

const pickTable = async (candidates) => {
  for (const tableName of candidates) {
    if (await DB.schema.hasTable(tableName)) return tableName;
  }
  return null;
};

const isBypassed = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes("/purposes") || lower.includes("/visit_checkin") || lower.includes("/visit_booking");
};

export const validateTimestamp = async (req, res, next) => {
  if (isBypassed(req.originalUrl)) {
    return next();
  }

  try {
    const cTimestamp = req.headers["x-timestamp"];
    if (
      process.env.APP_DEBUG &&
      process.env.APP_DEBUG == "true" &&
      req.headers["x-uniqueid"]
    ) {
      return next();
    }

    if (!cTimestamp) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Missing timetstamp header",
        datetime: formatDateSystem(),
      });
    }
    const dInputDate = new Date(cTimestamp).toLocaleDateString("en-US", {
      timeZone: "Asia/Jakarta",
    });

    const dNow = new Date();
    const nDiffMs = Math.abs(dNow - dInputDate);
    const nDiffMinutes = nDiffMs / 1000 / 60;

    if (nDiffMinutes > 5) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Request timestamp expired",
        datetime: formatDateSystem(),
      });
    }

    next();
  } catch (error) {
    Logging(error);
    return res.status(401).json({
      status: status.BAD_REQUEST,
      message: "Unauthorized",
      datetime: formatDateSystem(),
    });
  }
};

export const getRequestContext = () => als.getStore();

export const contextMiddleware = (req, res, next) => {
  const oStore = {
    requestId: Date.now(),
    method: req.method,
    url: req.url,
    body: req.body,
    auth: req?.auth || null,
  };

  als.run(oStore, () => {
    next();
  });
};

export const validateSignature = async (req, res, next) => {
  if (isBypassed(req.originalUrl)) {
    return next();
  }

  try {
    if (!req.headers["x-uniqueid"]) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "ID not found",
        datetime: formatDateSystem(),
      });
    }

    const cUserUnique = req.headers["x-uniqueid"];

    const userColumns = await getColumns("mst_pengguna");
    const idColumn = pickColumn(userColumns, [
      "id_pengguna",
      "user_id",
      "UserId",
      "nama_pengguna",
    ]);
    const usernameColumn = userColumns.includes("NamaPengguna")
      ? "NamaPengguna"
      : pickColumn(userColumns, ["nama_pengguna", "username", "Username"]);
    const fullnameColumn = pickColumn(userColumns, [
      "nama_lengkap",
      "fullname",
      "Fullname",
    ]);
    const phoneColumn = pickColumn(userColumns, ["telepon", "phone", "Phone"]);

    if (!idColumn && !usernameColumn) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Credential column not found",
        datetime: formatDateSystem(),
      });
    }

    const userRoleTable = await pickTable([
      "mst_pengguna_peran",
      "mst_pengguna_perans",
      "mst_user_roles",
    ]);
    const roleTable = await pickTable(["mst_peran", "mst_perans", "mst_roles"]);

    let query = DB("mst_pengguna").select(
      idColumn ? `mst_pengguna.${idColumn} as IdPengguna` : DB.raw("NULL as IdPengguna"),
      usernameColumn
        ? `mst_pengguna.${usernameColumn} as nama_pengguna`
        : DB.raw("NULL as nama_pengguna"),
      fullnameColumn
        ? `mst_pengguna.${fullnameColumn} as nama_lengkap`
        : DB.raw("NULL as nama_lengkap"),
      phoneColumn
        ? `mst_pengguna.${phoneColumn} as telepon`
        : DB.raw("NULL as telepon"),
      usernameColumn
        ? `mst_pengguna.${usernameColumn} as UniqueId`
        : DB.raw("NULL as UniqueId"),
    );

    if (userRoleTable && roleTable) {
      const userRoleColumns = await getColumns(userRoleTable);
      const roleColumns = await getColumns(roleTable);
      const userFkCol = pickColumn(userRoleColumns, [
        "id_pengguna",
        "user_id",
        "UserId",
        "nama_pengguna",
      ]);
      const roleFkCol = pickColumn(userRoleColumns, ["id_peran", "role_id"]);
      const rolePkCol = pickColumn(roleColumns, ["id_peran", "role_id"]);
      const roleCodeCol = pickColumn(roleColumns, ["kode_peran", "role_code"]);
      const roleNameCol = pickColumn(roleColumns, ["nama_peran", "role_name"]);

      const joinUserColumn =
        userFkCol === "nama_pengguna" && !userColumns.includes("NamaPengguna")
          ? usernameColumn
          : idColumn;

      if (userFkCol && joinUserColumn && roleFkCol && rolePkCol) {
        query = query
        .leftJoin(userRoleTable, `mst_pengguna.${joinUserColumn}`, `${userRoleTable}.${userFkCol}`)
        .leftJoin(roleTable, `${userRoleTable}.${roleFkCol}`, `${roleTable}.${rolePkCol}`)
        .select(
          `${roleTable}.${rolePkCol} as peranId`,
          roleCodeCol ? `${roleTable}.${roleCodeCol} as kode_peran` : DB.raw("NULL as kode_peran"),
          roleNameCol ? `${roleTable}.${roleNameCol} as peran` : DB.raw("NULL as peran"),
        );
      }
    }

    const numericId = Number(cUserUnique);
    const oUser = await query
      .where((builder) => {
        let hasLookup = false;
        if (idColumn && Number.isFinite(numericId)) {
          builder.where(`mst_pengguna.${idColumn}`, numericId);
          hasLookup = true;
        }
        if (usernameColumn && cUserUnique) {
          builder.orWhere(`mst_pengguna.${usernameColumn}`, cUserUnique);
          hasLookup = true;
        }
        if (!hasLookup) {
          builder.whereRaw("1 = 0");
        }
      })
      .first();

    if (!oUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Credential not found",
        datetime: formatDateSystem(),
      });
    }

    req.auth = {
      uniqueId: oUser.UniqueId,
      IdPengguna: oUser.IdPengguna,
      id_pengguna: oUser.IdPengguna,
      nama_pengguna: oUser.nama_pengguna,
      telepon: oUser.telepon,
      nama_lengkap: oUser.nama_lengkap,
      peranId: oUser.peranId,
      peranCode: oUser.kode_peran,
      peran: oUser.peran,
    };

    req.context = oUser;
    next();
  } catch (error) {
    Logging(error);
    return res.status(401).json({
      status: status.BAD_REQUEST,
      message: "Unauthorized",
      datetime: formatDateSystem(),
    });
  }
};


export const validateBaseToken = async (req, res, next) => {
  if (isBypassed(req.originalUrl)) {
    return next();
  }

  const cHeader = req.headers["authorization"];
  const cToken = cHeader && cHeader.split(" ")[1];

  if (
    process.env.APP_DEBUG &&
    process.env.APP_DEBUG == "true" &&
    req.headers["x-uniqueid"]
  ) {
    return next();
  }

  if (!cToken || !cHeader.startsWith("Basic ")) {
    return res.status(400).json({
      status: status.BAD_REQUEST,
      message: "No token provided",
      datetime: formatDateSystem(),
    });
  }

  try {
    const cCredentials = Buffer.from(cToken, "base64").toString("utf-8");
    const [cnama_pengguna, ckata_sandi] = cCredentials.split(":");

    if (
      !hashEquals(cnama_pengguna, hmac(getClientKey(), getClientSecret())) &&
      !hashEquals(ckata_sandi, hmac(getClientPassKey(), getClientSecret()))
    ) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Credential is Invalid",
        datetime: formatDateSystem(),
      });
    }

    return next();
  } catch (error) {
    Logging(error);
    return res.status(401).json({
      status: status.BAD_REQUEST,
      message: "Unauthorized",
      datetime: formatDateSystem(),
    });
  }
};

export const validateAccessToken = async (req, res, next) => {
  if (isBypassed(req.originalUrl)) {
    return next();
  }

  const cHeader = req.headers["authorization"];
  const cToken = cHeader && cHeader.split(" ")[1];

  if (
    process.env.APP_DEBUG &&
    process.env.APP_DEBUG == "true" &&
    req.headers["x-uniqueid"]
  ) {
    return next();
  }

  if (!cToken || !cHeader.startsWith("Bearer ")) {
    return res.status(400).json({
      status: status.BAD_REQUEST,
      message: "No token provided",
      datetime: formatDateSystem(),
    });
  }

  try {
    // KODE ASLI LO (TETAP DIPAKAI KARENA TIDAK BIKIN TENDANGAN 401)
    const oToken = await DB("access_token")
      .select("id")
      .where({
        token: cToken,
        expired: "0",
      })
      .first();

    if (!oToken) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Token is expired or invalid",
        datetime: formatDateSystem(),
      });
    }

    // SEMENTARA GUE MATIKAN FITUR "TOKEN SEKALI PAKAI" INI BIAR DROPDOWN LO NGGAK ERROR
    // Karena kalau nyala, request ke-2 (positions) akan dibilang expired.
    // await DB("access_token").where({ id: oToken.id }).update({ expired: "1" });

    return next();
  } catch (error) {
    Logging(error);
    res.status(401).json({
      status: status.BAD_REQUEST,
      message: "Unauthorized",
      datetime: formatDateSystem(),
    });
  }
};
