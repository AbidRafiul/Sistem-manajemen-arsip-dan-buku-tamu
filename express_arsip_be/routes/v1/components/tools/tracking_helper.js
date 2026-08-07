import DB from "../../../../core/config/knex.js";

const rowsFromRaw = (result) =>
  Array.isArray(result?.[0]) ? result[0] : result?.rows || result || [];

const getExistingTable = async (candidates) => {
  for (const tableName of candidates) {
    if (await DB.schema.hasTable(tableName)) return tableName;
  }
  return null;
};

const getColumns = async (tableName) => {
  if (!tableName) return [];
  const result = await DB.raw("SHOW COLUMNS FROM ??", [tableName]);
  return rowsFromRaw(result).map((column) => column.Field);
};

const pickColumn = (columns, candidates) =>
  candidates.find((columnName) => columns.includes(columnName)) || null;

const assignIfColumnExists = (target, columns, columnName, value) => {
  if (columnName && columns.includes(columnName)) target[columnName] = value;
};

export const insertIncomingLetterTracking = async (trx, data) => {
  const dbInstance = trx || DB;
  const trackingTable = await getExistingTable([
    "trs_tracking_surat_masuk",
    "trx_incoming_letter_trackings",
  ]);

  if (!trackingTable) return;

  const trackingColumns = await getColumns(trackingTable);
  const trackingPayload = {};

  const trackingLetterIdColumn = pickColumn(trackingColumns, ["surat_masuk_id", "incoming_letter_id"]);
  const trackingDispositionIdColumn = pickColumn(trackingColumns, ["disposisi_surat_id", "disposisi_id", "disid_jabatan"]);
  const trackingActionColumn = pickColumn(trackingColumns, ["nama_aksi", "action_name"]);
  const trackingFromColumn = pickColumn(trackingColumns, ["dari_pengguna_id", "from_id_pengguna", "from_nama_pengguna", "from_user_id"]);
  const trackingToColumn = pickColumn(trackingColumns, ["kepada_pengguna_id", "to_id_pengguna", "to_nama_pengguna", "to_user_id"]);
  const previousStatusColumn = pickColumn(trackingColumns, ["status_sebelumnya", "previous_status"]);
  const currentStatusColumn = pickColumn(trackingColumns, ["status_saat_ini", "current_status"]);
  const trackingNoteColumn = pickColumn(trackingColumns, ["catatan", "notes"]);

  assignIfColumnExists(trackingPayload, trackingColumns, trackingLetterIdColumn, data.surat_masuk_id);
  assignIfColumnExists(trackingPayload, trackingColumns, trackingDispositionIdColumn, data.disposisi_surat_id || null);
  assignIfColumnExists(trackingPayload, trackingColumns, trackingActionColumn, data.nama_aksi);
  assignIfColumnExists(trackingPayload, trackingColumns, trackingFromColumn, data.dari_pengguna_id || null);
  assignIfColumnExists(trackingPayload, trackingColumns, trackingToColumn, data.kepada_pengguna_id || null);
  assignIfColumnExists(trackingPayload, trackingColumns, previousStatusColumn, data.status_sebelumnya || null);
  assignIfColumnExists(trackingPayload, trackingColumns, currentStatusColumn, data.status_saat_ini);
  assignIfColumnExists(trackingPayload, trackingColumns, trackingNoteColumn, data.catatan);

  assignIfColumnExists(trackingPayload, trackingColumns, "processed_at", data.processed_at || new Date());
  assignIfColumnExists(trackingPayload, trackingColumns, "created_by", data.created_by || null);
  assignIfColumnExists(trackingPayload, trackingColumns, "created_at", data.created_at || new Date());
  assignIfColumnExists(trackingPayload, trackingColumns, "updated_at", data.updated_at || new Date());

  await dbInstance(trackingTable).insert(trackingPayload);
};
