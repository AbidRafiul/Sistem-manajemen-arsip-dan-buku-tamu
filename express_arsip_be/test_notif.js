import knex from "knex";
import knexConfig from "./knexfile.js";
const db = knex(knexConfig.development);
try {
  const cabangs = await db("mst_cabang").select("id_cabang", "nama_cabang");
  console.log("Branches in database:", cabangs);
} catch (e) {
  console.error("ERROR:", e.message);
} finally {
  await db.destroy();
}
