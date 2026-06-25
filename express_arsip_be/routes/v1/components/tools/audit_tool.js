import DB from "../../../../core/config/knex.js";
import { formatDateSystem } from "./general.js";

/**
 * Fungsi untuk mencatat aktivitas ke tabel mst_riwayat_audit
 * Bisa dipanggil dari file mana aja (Login, Update User, Delete User, dll)
 */
export const recordAuditTrail = async (
  nama_pengguna,
  peran,
  action,
  req,
  status = "SUKSES",
) => {
  try {
<<<<<<< HEAD
    const cIp = req?.headers?.["x-forwarded-for"] 
      ? req.headers["x-forwarded-for"].split(",")[0].trim() 
      : req?.ip || req?.connection?.remoteAddress || "Unknown";
      
    await DB("mst_audit_trails").insert({
      username,
      role,
      action,
      ip_address: cIp,
      user_agent: req?.headers?.["user-agent"] || "Unknown",
      status,
      created_at: formatDateSystem()
=======
    const cIp = req?.headers?.["x-forwarded-for"]
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req?.ip || req?.connection?.remotealamat || "Unknown";

    await DB("mst_riwayat_audit").insert({
      nama_pengguna: nama_pengguna,
      peran: peran,
      Action: action,
      Ipalamat: cIp,
      UserAgent: req?.headers?.["user-agent"] || "Unknown",
      Status: status,
      CreatedAt: formatDateSystem(),
>>>>>>> main
    });
  } catch (error) {
    console.error("Gagal mencatat audit trail:", error);
  }
};
