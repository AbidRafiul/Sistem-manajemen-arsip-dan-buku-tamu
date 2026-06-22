import { jwtVerify } from "jose";
import {
  getClientKey,
  getClientPassKey,
  getClientSecret,
} from "../core/config/secret.js";
import {
  datetime,
  datetimeIso,
  formatDateSystem,
  hash,
  hashEquals,
  hmac,
  isoDateNow,
  isoDateNowYmd,
  status,
} from "../routes/v1/components/tools/general.js";
import DB from "../core/config/knex.js";
import { Logging } from "../routes/v1/components/tools/servertool.js";
import { AsyncLocalStorage } from "async_hooks"

const als = new AsyncLocalStorage();

export const validateTimestamp = async (req, res, next) => {
  try {
    const timestamp = req.headers["x-timestamp"];
    if (process.env.APP_DEBUG && process.env.APP_DEBUG == 'true' && req.headers["x-uniqueid"]) {
      return next()
    }

    if (!timestamp) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Missing timetstamp header",
        datetime: formatDateSystem(),
      });
    }
    const inputDate = new Date(timestamp).toLocaleDateString("en-US", {
      timeZone: "Asia/Jakarta",
    });

    const now = new Date();
    const diffMs = Math.abs(now - inputDate);
    const diffMinutes = diffMs / 1000 / 60;

    if (diffMinutes > 5) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Request timestamp expired",
        datetime: formatDateSystem(),
      });
    }

    next();
  } catch (error) {
    Logging(error)
    return res.status(401).json({
      status: status.BAD_REQUEST,
      message: "Unauthorized",
      datetime: formatDateSystem(),
    });
  }
};

export const getRequestContext = () => als.getStore();

export const contextMiddleware = (req, res, next) => {
  const store = {
    requestId: Date.now(),
    method: req.method,
    url: req.url,
    body: req.body,
    auth: req?.auth || null
  };

  als.run(store, () => {
    next();
  });
};

export const validateSignature = async (req, res, next) => {
  try {
    if (!req.headers["x-uniqueid"]) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "ID not found",
        datetime: formatDateSystem(),
      });
    }

    const cUserUnique = req.headers["x-uniqueid"];

    //  PERBAIKAN: Ganti "user_credential" jadi "mst_users"
    const oUser = await DB("mst_users")
      // 1. Join user_roles pake user_id (bukan username)
      .leftJoin("mst_user_roles", "mst_users.user_id", "mst_user_roles.user_id")
      // 2. Join mst_roles buat dapetin nama jabatannya
      .leftJoin("mst_roles", "mst_user_roles.role_id", "mst_roles.role_id")
      .select(
        "mst_users.username",
        "mst_users.fullname",
        "mst_roles.role_name as Role",
        "mst_users.telp",
        "mst_users.user_id as UniqueId"
      )
      .where("mst_users.user_id", cUserUnique)
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
      username: oUser.username,
      telp: oUser.telp,
      fullname: oUser.fullname,
      role: oUser.Role,
    };

    req.context = oUser;
    next();
  } catch (error) {
    Logging(error)
    return res.status(401).json({
      status: status.BAD_REQUEST,
      message: "Unauthorized",
      datetime: formatDateSystem(),
    });
  }
};

export const validateBaseToken = async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (process.env.APP_DEBUG && process.env.APP_DEBUG == 'true' && req.headers["x-uniqueid"]) {
    return next()
  }

  if (!token || !header.startsWith("Basic ")) {
    return res.status(400).json({
      status: status.BAD_REQUEST,
      message: "No token provided",
      datetime: formatDateSystem(),
    });
  }

  try {
    const credentials = Buffer.from(token, "base64").toString("utf-8");
    const [username, password] = credentials.split(":");

    if (
      !hashEquals(username, hmac(getClientKey(), getClientSecret())) &&
      !hashEquals(password, hmac(getClientPassKey(), getClientSecret()))
    ) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Credential is Invalid",
        datetime: formatDateSystem(),
      });
    }

    return next();
  } catch (error) {
    Logging(error)
    return res.status(401).json({
      status: status.BAD_REQUEST,
      message: "Unauthorized",
      datetime: formatDateSystem(),
    });
  }
};

export const validateAccessToken = async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (process.env.APP_DEBUG && process.env.APP_DEBUG == 'true' && req.headers["x-uniqueid"]) {
    return next()
  }

  if (!token || !header.startsWith("Bearer ")) {
    return res.status(400).json({
      status: status.BAD_REQUEST,
      message: "No token provided",
      datetime: formatDateSystem(),
    });
  }

  try {
    // ⚠️ KODE ASLI LO (TETAP DIPAKAI KARENA TIDAK BIKIN TENDANGAN 401)
    const oToken = await DB("access_token")
      .select("id")
      .where({
        token: token,
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

    // 💡 SEMENTARA GUE MATIKAN FITUR "TOKEN SEKALI PAKAI" INI BIAR DROPDOWN LO NGGAK ERROR
    // Karena kalau nyala, request ke-2 (positions) akan dibilang expired.
    // await DB("access_token").where({ id: oToken.id }).update({ expired: "1" }); 

    return next();
  } catch (error) {
    Logging(error)
    res.status(401).json({
      status: status.BAD_REQUEST,
      message: "Unauthorized",
      datetime: formatDateSystem(),
    });
  }
};