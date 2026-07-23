import DB from "../../../../core/config/knex.js";
import { formatDateSystem } from "./general.js";

const getTableColumns = async (tableName) => {
  try {
    const [cols] = await DB.raw(`SHOW COLUMNS FROM \`${tableName}\``);
    return cols.map((col) => col.Field);
  } catch (error) {
    return [];
  }
};

const pickColumn = (columns, candidates) => {
  return candidates.find((column) => columns.includes(column)) || null;
};

/**
 * Fungsi untuk mencatat aktivitas ke tabel mst_riwayat_audit
 * Bisa dipanggil dari file mana aja (Login, Update User, Delete User, dll)
 *
 * Kolom aktual di DB berbeda antar migration lama/baru, jadi nama kolom dipilih dinamis.
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

    const auditColumns = await getTableColumns("mst_riwayat_audit");
    const userColumn = pickColumn(auditColumns, ["nama_pengguna", "username"]);
    const roleColumn = pickColumn(auditColumns, ["peran", "role"]);
    const actionColumn = pickColumn(auditColumns, ["aksi", "action"]);
    const ipColumn = pickColumn(auditColumns, ["alamat_ip", "ip_alamat", "ip_address"]);
    const userAgentColumn = pickColumn(auditColumns, ["agen_pengguna", "user_agent"]);

    if (!userColumn || !roleColumn || !actionColumn) {
      console.error("Gagal mencatat audit trail: kolom wajib audit tidak ditemukan");
      return;
    }

    const payload = {
      [userColumn]: nama_pengguna,
      [roleColumn]: peran,
      [actionColumn]: action,
      status,
      created_at: formatDateSystem(),
    };

    if (ipColumn) payload[ipColumn] = cIp;
    if (userAgentColumn) payload[userAgentColumn] = req?.headers?.["user-agent"] || "Unknown";

    await DB("mst_riwayat_audit").insert(payload);
  } catch (error) {
    console.error("Gagal mencatat audit trail:", error);
  }
};
