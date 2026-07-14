import DB from "../../../../core/config/knex.js";
import { formatDateSystem } from "./general.js";

/**
 * Fungsi untuk mencatat aktivitas ke tabel mst_riwayat_audit
 * Bisa dipanggil dari file mana aja (Login, Update User, Delete User, dll)
 *
 * Kolom aktual di DB: id, username, role, aksi, alamat_ip, agen_pengguna, status, created_at
 */
export const recordAuditTrail = async (
  nama_pengguna,
  peran,
  action,
  req,
  status = "SUKSES",
) => {
  try {
    const cIp = req?.headers?.["x-forwarded-for"]
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req?.ip || req?.connection?.remoteAddress || "Unknown";

    await DB("mst_riwayat_audit").insert({
      username: nama_pengguna,
      role: peran,
      aksi: action,
      alamat_ip: cIp,
      agen_pengguna: req?.headers?.["user-agent"] || "Unknown",
      status,
      created_at: formatDateSystem(),
    });
  } catch (error) {
    console.error("Gagal mencatat audit trail:", error);
  }
};
