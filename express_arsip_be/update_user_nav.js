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
  },
});

// ─── Definisi grup menu yang harus ada ───────────────────────────────────────

const BUKU_TAMU_GROUP = {
  label: "BUKU TAMU",
  icon: "pi pi-fw pi-book",
  items: [
    {
      label: "Registrasi Tamu",
      icon: "pi pi-fw pi-id-card",
      to: "/buku_tamu/registrasi",
    },
    {
      label: "Monitoring Tamu",
      icon: "pi pi-fw pi-list",
      to: "/buku_tamu/monitoring",
    },
    {
      label: "Checkout Tamu",
      icon: "pi pi-fw pi-sign-out",
      to: "/buku_tamu/checkout",
    },
  ],
};

const PERSURATAN_GROUP = {
  label: "PERSURATAN",
  icon: "pi pi-fw pi-envelope",
  items: [
    {
      label: "Surat Masuk",
      icon: "pi pi-fw pi-inbox",
      items: [
        {
          label: "Dashboard",
          icon: "pi pi-fw pi-chart-line",
          to: "/correspondence/mail_in",
        },
        {
          label: "Data Surat Masuk",
          icon: "pi pi-fw pi-table",
          to: "/correspondence/mail_in/data",
        },
        {
          label: "Disposisi Surat",
          icon: "pi pi-fw pi-send",
          to: "/correspondence/mail_in/disposition",
        },
      ],
    },
  ],
};

const ARSIP_GROUP = {
  label: "ARSIP DOKUMEN",
  icon: "pi pi-fw pi-folder",
  items: [
    {
      label: "Dokumen Arsip",
      icon: "pi pi-fw pi-folder-open",
      to: "/edms/archive_document",
    },
    {
      label: "Peminjaman Arsip",
      icon: "pi pi-fw pi-share-alt",
      to: "/edms/archive_loan",
    },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function hasGroup(menu, labelUpper) {
  return (
    Array.isArray(menu) &&
    menu.some((g) => g.label?.toUpperCase() === labelUpper)
  );
}

function safeParseMenu(raw) {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

function insertBefore(menu, newGroup, targetLabels) {
  const idx = menu.findIndex((g) =>
    targetLabels.includes(g.label?.toUpperCase()),
  );
  if (idx >= 0) {
    menu.splice(idx, 0, newGroup);
  } else {
    menu.push(newGroup);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    // Cek kolom yang tersedia di tabel
    const [cols] = await db.raw("SHOW COLUMNS FROM `navigasi_pengguna`");
    const colNames = cols.map((c) => c.Field);
    console.log("Kolom tersedia:", colNames.join(", "));

    const menuCol = colNames.find((c) => ["menu", "Menu"].includes(c));
    const pkCol = colNames.find((c) =>
      ["id_pengguna", "id_pengguna", "nama_pengguna", "NamaPengguna"].includes(
        c,
      ),
    );
    const updatedAtCol = colNames.find((c) =>
      ["updated_at", "UpdatedAt"].includes(c),
    );

    if (!menuCol || !pkCol) {
      console.error("❌ Kolom menu atau primary key tidak ditemukan!");
      return;
    }

    // Ambil semua user di navigasi_pengguna
    const rows = await db("navigasi_pengguna").select("*");
    console.log(`\nDitemukan ${rows.length} user di navigasi_pengguna\n`);

    let totalUpdated = 0;

    for (const row of rows) {
      const pkValue = row[pkCol];
      const menu = safeParseMenu(row[menuCol]);

      if (!Array.isArray(menu)) {
        console.log(`  ⚠️  ${pkCol}=${pkValue}: menu tidak valid, dilewati`);
        continue;
      }

      let changed = false;

      // 1. Tambah BUKU TAMU (sebelum ARSIP DOKUMEN)
      if (!hasGroup(menu, "BUKU TAMU")) {
        insertBefore(menu, BUKU_TAMU_GROUP, ["ARSIP DOKUMEN", "ARSIP", "EDMS"]);
        console.log(`  ✅ ${pkCol}=${pkValue}: + BUKU TAMU`);
        changed = true;
      } else {
        console.log(`  ✓  ${pkCol}=${pkValue}: BUKU TAMU sudah ada`);
      }

      // 2. Tambah PERSURATAN (sebelum ARSIP DOKUMEN)
      if (!hasGroup(menu, "PERSURATAN")) {
        insertBefore(menu, PERSURATAN_GROUP, [
          "ARSIP DOKUMEN",
          "ARSIP",
          "EDMS",
        ]);
        console.log(`  ✅ ${pkCol}=${pkValue}: + PERSURATAN`);
        changed = true;
      } else {
        console.log(`  ✓  ${pkCol}=${pkValue}: PERSURATAN sudah ada`);
      }

      // 3. Pastikan ARSIP DOKUMEN ada
      if (
        !hasGroup(menu, "ARSIP DOKUMEN") &&
        !hasGroup(menu, "ARSIP") &&
        !hasGroup(menu, "EDMS")
      ) {
        menu.push(ARSIP_GROUP);
        console.log(`  ✅ ${pkCol}=${pkValue}: + ARSIP DOKUMEN`);
        changed = true;
      }

      if (changed) {
        const updatePayload = { [menuCol]: JSON.stringify(menu) };
        if (updatedAtCol) updatePayload[updatedAtCol] = new Date();

        await db("navigasi_pengguna")
          .where(pkCol, pkValue)
          .update(updatePayload);

        totalUpdated++;
      }
    }

    console.log(
      `\n✅ Selesai! ${totalUpdated} dari ${rows.length} user diupdate.`,
    );
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await db.destroy();
  }
}

main();
