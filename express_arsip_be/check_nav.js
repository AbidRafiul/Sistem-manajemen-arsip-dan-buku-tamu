import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "db_magang",
    port: Number(process.env.DB_PORT) || 3306,
  }
});

async function main() {
  try {
    const mst = await db("mst_navigation").select("*");
    console.log("=== mst_navigation ===");
    console.log(JSON.stringify(mst, null, 2));

    const userNav = await db("user_navigation").select("*");
    console.log("=== user_navigation ===");
    console.log(JSON.stringify(userNav, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

main();
