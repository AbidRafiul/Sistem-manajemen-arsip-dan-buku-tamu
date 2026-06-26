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
    const [columns] = await DB.raw("SHOW COLUMNS FROM `mst_riwayat_audit`");
    const columnNames = columns.map((column) => column.Field);
    const pick = (...candidates) =>
      candidates.find((candidate) => columnNames.includes(candidate));
    const cIp = req?.headers?.["x-forwarded-for"]
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req?.ip || req?.connection?.remoteAddress || "Unknown";

    const row = {};
    row[pick("nama_pengguna", "username", "Username")] = nama_pengguna;
    row[pick("peran", "role", "Role")] = peran;
    row[pick("aksi", "action", "Action")] = action;
    row[pick("alamat_ip", "ip_address", "Ipalamat", "IpAddress")] = cIp;
    row[pick("agen_pengguna", "user_agent", "UserAgent")] =
      req?.headers?.["user-agent"] || "Unknown";
    row[pick("status", "Status")] = status;
    row[pick("created_at", "CreatedAt")] = formatDateSystem();

    await DB("mst_riwayat_audit").insert(row);
  } catch (error) {
    console.error("Gagal mencatat audit trail:", error);
  }
};
