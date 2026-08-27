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

const isBypassed = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes("/purposes") ||
    lower.includes("/branches") ||
    lower.includes("/buku_tamu/visit_data/branches") ||
    lower.includes("/visit_checkin") ||
    lower.includes("/visit_booking") ||
    lower.includes("/visit_data/users") ||
    lower.includes("/outgoing-file-download") ||
    lower.includes("/incoming-file-download")
  );
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
      tz: "Asia/Jakarta",
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
    tz: req.headers["x-tz"] || "Asia/Jakarta",
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

    const query = DB("mst_pengguna as pengguna")
      .leftJoin(
        "mst_pengguna_peran as pengguna_peran",
        "pengguna.id_pengguna",
        "pengguna_peran.id_pengguna",
      )
      .leftJoin(
        "mst_peran as peran",
        "pengguna_peran.id_peran",
        "peran.id_peran",
      )
      .select(
        "pengguna.id_pengguna as IdPengguna",
        "pengguna.nama_pengguna",
        "pengguna.nama_lengkap",
        "pengguna.telepon",
        "pengguna.id_cabang",
        "pengguna.nama_pengguna as UniqueId",
        "pengguna.id_cabang",
        "pengguna.id_departemen",
        "pengguna.id_divisi",
        "pengguna.id_unit_kerja",
        "peran.id_peran as peranId",
        "peran.kode_peran",
        "peran.nama_peran as peran",
      );

    const numericId = Number(cUserUnique);
    const oUser = await query
      .where((builder) => {
        builder.where("pengguna.id_pengguna", numericId || 0);
        if (cUserUnique) {
          builder.orWhere("pengguna.nama_pengguna", cUserUnique);
        }
      })
      .orderBy("pengguna_peran.peran_utama", "desc")
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
      id_cabang: oUser.id_cabang,
      peranId: oUser.peranId,
      peranCode: oUser.kode_peran,
      peran: oUser.peran,
    };

    req.context = {
      ...oUser,
      tz: req.headers["x-tz"] || "Asia/Jakarta"
    };

    // RBAC: Data Isolation by Cabang (Hierarchical)
    let allowedCabangIds = null;
    const allCabangs = await DB("mst_cabang").select("id_cabang", "id_induk").whereNot("status", "deleted");

    if (oUser.kode_peran !== 'SUPERADMIN' && oUser.kode_peran !== 'SA') {
      if (oUser.id_cabang) {
        allowedCabangIds = new Set([oUser.id_cabang]);
        // Hanya ambil keturunan SATU LEVEL ke bawah (anak langsung)
        for (const c of allCabangs) {
          if (c.id_induk === oUser.id_cabang && !allowedCabangIds.has(c.id_cabang)) {
            allowedCabangIds.add(c.id_cabang);
          }
        }
      }
    }

    // Helper untuk ekspansi cabang beserta anak-anak cabangnya (SATU LEVEL SAJA)
    const expandCabangDescendants = (initialIds) => {
      const expandedSet = new Set(initialIds);
      for (const c of allCabangs) {
        // Cek apakah cabang induknya ada di dalam initialIds (bukan expandedSet agar tidak menjalar ke bawah)
        if (initialIds.includes(c.id_induk) && !expandedSet.has(c.id_cabang)) {
          expandedSet.add(c.id_cabang);
        }
      }
      return Array.from(expandedSet);
    };

    const reqCabang = req.headers['x-filter-cabang'];
    const isExact = req.headers['x-exact-cabang'] === 'true';

    if (reqCabang && reqCabang !== 'null' && reqCabang !== 'undefined') {
      const requestedIds = String(reqCabang).split(",").map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      const expandedRequestedIds = isExact ? requestedIds : expandCabangDescendants(requestedIds);

      if (allowedCabangIds) {
        // Jika Admin Daerah, pastikan cabang yang dipilih berada dalam wewenangnya
        const validIds = expandedRequestedIds.filter(id => allowedCabangIds.has(id));
        if (validIds.length > 0) {
          req.headers['x-filter-cabang'] = validIds.join(",");
        } else {
          req.headers['x-filter-cabang'] = isExact && oUser.id_cabang ? String(oUser.id_cabang) : Array.from(allowedCabangIds).join(",");
        }
      } else {
        // Superadmin / Full Access: gunakan cabang yang dipilih
        req.headers['x-filter-cabang'] = expandedRequestedIds.join(",");
      }
    } else {
      if (allowedCabangIds) {
        req.headers['x-filter-cabang'] = isExact && oUser.id_cabang ? String(oUser.id_cabang) : Array.from(allowedCabangIds).join(",");
      } else {
        // Superadmin tanpa filter cabang spesifik: izinkan seluruh cabang di sistem (atau cabang user jika exact)
        req.headers['x-filter-cabang'] = isExact && oUser.id_cabang ? String(oUser.id_cabang) : allCabangs.map(c => c.id_cabang).join(",");
      }
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

  let cHeader = req.headers["authorization"];
  if (!cHeader && req.query?.token) {
    cHeader = "Bearer " + req.query.token;
    req.headers["authorization"] = cHeader;
  }
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
