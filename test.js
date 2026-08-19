import dotenv from 'dotenv';
dotenv.config({ path: './express_arsip_be/.env' });
import DB from './express_arsip_be/core/config/knex.js';
async function run() {
  const res = await DB.raw('SHOW COLUMNS FROM mst_cabang LIKE \"status\"');
  console.log(res[0]);
  process.exit(0);
}
run();
