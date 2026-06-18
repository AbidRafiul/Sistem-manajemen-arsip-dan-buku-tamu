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
    const userNav = await db("user_navigation").where("UniqueId", "USR000000").first();
    if (!userNav) {
      console.log("User navigation for USR000000 not found!");
      return;
    }

    const currentMenu = JSON.parse(userNav.Menu);
    
    // Remove any existing ARSIP DOKUMEN group to avoid duplicates
    const filteredMenu = currentMenu.filter(
      item => item.label?.toUpperCase() !== "ARSIP DOKUMEN" && item.label?.toUpperCase() !== "EDMS" && item.label?.toUpperCase() !== "ARSIP"
    );

    // Add updated ARSIP DOKUMEN group
    filteredMenu.push({
      label: "ARSIP DOKUMEN",
      icon: "pi pi-folder",
      items: [
        { label: "Dokumen Arsip", icon: "pi pi-fw pi-folder-open", to: "/edms/archive_document" },
        { label: "Peminjaman Arsip", icon: "pi pi-fw pi-share-alt", to: "/edms/archive_loan" }
      ]
    });

    await db("user_navigation")
      .where("UniqueId", "USR000000")
      .update({
        Menu: JSON.stringify(filteredMenu),
        UpdatedAt: new Date()
      });

    console.log("Successfully updated menu in database!");
  } catch (err) {
    console.error("Error updating database:", err);
  } finally {
    await db.destroy();
  }
}

main();
