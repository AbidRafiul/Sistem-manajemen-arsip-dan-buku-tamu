import DB from "../../../../core/config/knex.js";

/**
 * Mencatat riwayat perubahan dokumen ke tabel trs_riwayat_dokumen
 *
 * @param {Object} options
 * @param {string} options.kodeDokumen - Kode unik dokumen
 * @param {string} options.aksi - 'create'|'update'|'delete'|'version_upload'|'version_approve'|'version_reject'|'version_rollback'|'loan'|'return'
 * @param {string} options.deskripsi - Penjelasan ringkas aktivitas
 * @param {Object} [options.detailJson] - Detail diff perubahan
 * @param {string} [options.dilakukanOleh] - Username pengguna
 * @param {Object} [options.req] - Express request object (untuk extract IP)
 */
export const logDocumentChange = async ({
  kodeDokumen,
  aksi,
  deskripsi,
  detailJson = null,
  dilakukanOleh = null,
  req = null,
}) => {
  try {
    const dNow = new Date();
    const cUser =
      dilakukanOleh ||
      req?.auth?.nama_pengguna ||
      req?.context?.nama_pengguna ||
      "system";

    const cIp = req?.headers?.["x-forwarded-for"]
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req?.ip || req?.connection?.remoteAddress || null;

    await DB("trs_riwayat_dokumen").insert({
      kode_dokumen: kodeDokumen,
      aksi: aksi,
      deskripsi: deskripsi,
      detail_json: detailJson ? JSON.stringify(detailJson) : null,
      dilakukan_oleh: cUser,
      ip_alamat: cIp,
      created_at: dNow,
    });
  } catch (error) {
    console.error("[Audit Trail Log Error]:", error.message);
  }
};

/**
 * Helper untuk membuat diff JSON antara object lama dan baru
 */
export const buildChangeDiff = (oldData, newData, fieldsToCompare = []) => {
  if (!oldData || !newData) return null;
  const diff = {};

  const fields =
    fieldsToCompare.length > 0
      ? fieldsToCompare
      : Object.keys(newData).filter((k) => k !== "updated_at" && k !== "created_at");

  for (const field of fields) {
    if (newData[field] !== undefined && oldData[field] !== newData[field]) {
      // Ignore null vs empty string difference
      if (!oldData[field] && !newData[field]) continue;

      diff[field] = {
        lama: oldData[field] !== undefined ? oldData[field] : null,
        baru: newData[field],
      };
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
};
