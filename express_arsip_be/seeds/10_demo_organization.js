import { hmac } from "../routes/v1/components/tools/general.js";

export async function seed(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  const dNow = new Date();
  const secret = process.env.USER_SECRET;

  const peranBiasa = await knex("mst_peran").where("nama_peran", "Administrator").first();
  const oNavigation = await knex("mst_navigasi").where("peran", "master").first();

  const newBranches = [
    // 4 Tambahan Pusat Cabang (id_induk = 1 for Pusat Jakarta)
    { id_cabang: 5, id_induk: 1, kode_cabang: "CB-005", nama_cabang: "Pusat Bandung", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 6, id_induk: 1, kode_cabang: "CB-006", nama_cabang: "Pusat Semarang", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 7, id_induk: 1, kode_cabang: "CB-007", nama_cabang: "Pusat Yogyakarta", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 8, id_induk: 1, kode_cabang: "CB-008", nama_cabang: "Pusat Bali", status: "active", created_at: dNow, updated_at: dNow },
    
    // 10 Cabang Daerah (Tersebar)
    { id_cabang: 9, id_induk: 2, kode_cabang: "CB-009", nama_cabang: "Cabang Mojokerto", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 10, id_induk: 2, kode_cabang: "CB-010", nama_cabang: "Cabang Sidoarjo", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 11, id_induk: 5, kode_cabang: "CB-011", nama_cabang: "Cabang Cimahi", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 12, id_induk: 5, kode_cabang: "CB-012", nama_cabang: "Cabang Soreang", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 13, id_induk: 6, kode_cabang: "CB-013", nama_cabang: "Cabang Demak", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 14, id_induk: 6, kode_cabang: "CB-014", nama_cabang: "Cabang Kendal", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 15, id_induk: 7, kode_cabang: "CB-015", nama_cabang: "Cabang Bantul", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 16, id_induk: 7, kode_cabang: "CB-016", nama_cabang: "Cabang Sleman", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 17, id_induk: 8, kode_cabang: "CB-017", nama_cabang: "Cabang Denpasar", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 18, id_induk: 8, kode_cabang: "CB-018", nama_cabang: "Cabang Gianyar", status: "active", created_at: dNow, updated_at: dNow },

    // 10 Unit Kecamatan
    { id_cabang: 19, id_induk: 9, kode_cabang: "CB-019", nama_cabang: "Kecamatan Mojokerto Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 20, id_induk: 10, kode_cabang: "CB-020", nama_cabang: "Kecamatan Sidoarjo Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 21, id_induk: 11, kode_cabang: "CB-021", nama_cabang: "Kecamatan Cimahi Tengah", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 22, id_induk: 12, kode_cabang: "CB-022", nama_cabang: "Kecamatan Soreang Pusat", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 23, id_induk: 13, kode_cabang: "CB-023", nama_cabang: "Kecamatan Demak Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 24, id_induk: 14, kode_cabang: "CB-024", nama_cabang: "Kecamatan Kendal Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 25, id_induk: 15, kode_cabang: "CB-025", nama_cabang: "Kecamatan Bantul Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 26, id_induk: 16, kode_cabang: "CB-026", nama_cabang: "Kecamatan Sleman Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 27, id_induk: 17, kode_cabang: "CB-027", nama_cabang: "Kecamatan Denpasar Selatan", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 28, id_induk: 18, kode_cabang: "CB-028", nama_cabang: "Kecamatan Gianyar Kota", status: "active", created_at: dNow, updated_at: dNow },
  ];
  
  await knex("mst_cabang").insert(newBranches).onConflict("id_cabang").merge();

  const allBranchesToLoop = await knex("mst_cabang").orderBy("id_cabang", "asc");

  const departemens = [];
  const divisis = [];
  const units = [];

  for (const b of allBranchesToLoop) {
    const id1 = b.id_cabang === 1 ? 1 : b.id_cabang + 2;
    const id2 = b.id_cabang === 1 ? 2 : 200 + b.id_cabang;
    const id3 = 300 + b.id_cabang;
    const id4 = 400 + b.id_cabang;
    const id5 = 500 + b.id_cabang;

    // 5 Departemen per cabang
    departemens.push(
      { id_departemen: id1, id_cabang: b.id_cabang, kode_departemen: `DEPT-OPS-${b.id_cabang}`, nama_departemen: `Operasional ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_departemen: id2, id_cabang: b.id_cabang, kode_departemen: `DEPT-HRD-${b.id_cabang}`, nama_departemen: `SDM & Umum ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_departemen: id3, id_cabang: b.id_cabang, kode_departemen: `DEPT-KEU-${b.id_cabang}`, nama_departemen: `Keuangan & Akuntansi ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_departemen: id4, id_cabang: b.id_cabang, kode_departemen: `DEPT-IT-${b.id_cabang}`, nama_departemen: `Teknologi Informasi ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_departemen: id5, id_cabang: b.id_cabang, kode_departemen: `DEPT-AUD-${b.id_cabang}`, nama_departemen: `Audit & Kepatuhan ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow }
    );

    // 5 Divisi per cabang
    divisis.push(
      { id_divisi: id1, id_departemen: id1, kode_divisi: `DIV-OPS-${b.id_cabang}`, nama_divisi: `Divisi Layanan Operasional ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_divisi: id2, id_departemen: id2, kode_divisi: `DIV-HRD-${b.id_cabang}`, nama_divisi: `Divisi Kepegawaian ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_divisi: id3, id_departemen: id3, kode_divisi: `DIV-KEU-${b.id_cabang}`, nama_divisi: `Divisi Perbendaharaan ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_divisi: id4, id_departemen: id4, kode_divisi: `DIV-IT-${b.id_cabang}`, nama_divisi: `Divisi Infrastruktur IT ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_divisi: id5, id_departemen: id5, kode_divisi: `DIV-AUD-${b.id_cabang}`, nama_divisi: `Divisi Pengawasan Internal ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow }
    );

    // 5 Unit Kerja per cabang
    units.push(
      { id_unit_kerja: id1, id_divisi: id1, kode_unit_kerja: `UNIT-OPS-${b.id_cabang}`, nama_unit_kerja: `Unit Pelayanan Tamu & Admin ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_unit_kerja: id2, id_divisi: id2, kode_unit_kerja: `UNIT-HRD-${b.id_cabang}`, nama_unit_kerja: `Unit Rekrutmen & Training ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_unit_kerja: id3, id_divisi: id3, kode_unit_kerja: `UNIT-KEU-${b.id_cabang}`, nama_unit_kerja: `Unit Pembukuan & Pajak ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_unit_kerja: id4, id_divisi: id4, kode_unit_kerja: `UNIT-IT-${b.id_cabang}`, nama_unit_kerja: `Unit Maintenance Server ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow },
      { id_unit_kerja: id5, id_divisi: id5, kode_unit_kerja: `UNIT-AUD-${b.id_cabang}`, nama_unit_kerja: `Unit Pemeriksaan Dokumen ${b.nama_cabang}`, status: "active", created_at: dNow, updated_at: dNow }
    );
  }

  await knex("mst_departemen").insert(departemens).onConflict("id_departemen").merge();
  await knex("mst_divisi").insert(divisis).onConflict("id_divisi").merge();
  await knex("mst_unit_kerja").insert(units).onConflict("id_unit_kerja").merge();

  const allRoles = await knex("mst_peran").whereNot("kode_peran", "SUPERADMIN").orderBy("id_peran", "asc");
  const userRoleRecords = [];
  const userNavRecords = [];
  
  for (const b of allBranchesToLoop) {
    const id1 = b.id_cabang === 1 ? 1 : b.id_cabang + 2;
    const id2 = b.id_cabang === 1 ? 2 : 200 + b.id_cabang;
    const id5 = 500 + b.id_cabang;

    for (let idx = 0; idx < allRoles.length; idx++) {
      const role = allRoles[idx];
      let userId;
      let username;

      if (role.nama_peran === "Administrator") {
        userId = b.id_cabang === 1 ? 1001 : b.id_cabang + 5;
        username = `admin.${b.id_cabang}@admin.com`;
      } else {
        userId = 1000 + (idx * 100) + b.id_cabang;
        const prefix = role.nama_peran.toLowerCase().replace(/\s+/g, ".");
        username = `${prefix}.${b.id_cabang}@admin.com`;
      }

      const userpwd = hmac(process.env.USER_KEY + username + "Admin123!", secret, "sha512");
      await knex("mst_pengguna").where("nama_pengguna", username).del();

      let deptId = id1;
      let divId = id1;
      let unitId = id1;
      let jabId = 2; // Manager

      if (role.nama_peran === "Pimpinan") {
        deptId = id5; divId = id5; unitId = id5; jabId = 1; // Direktur
      } else if (role.nama_peran === "Sekretaris" || role.nama_peran === "Staff Arsip") {
        deptId = id2; divId = id2; unitId = id2;
      } else if (role.nama_peran === "Auditor") {
        deptId = id5; divId = id5; unitId = id5;
      }

      await knex("mst_pengguna").insert({
        id_pengguna: userId,
        nama_lengkap: `${role.nama_peran} ${b.nama_cabang}`,
        nama_pengguna: username,
        surel: username,
        telepon: "08" + (Math.floor(Math.random() * 90000000) + 10000000),
        kata_sandi: userpwd,
        id_cabang: b.id_cabang,
        id_departemen: deptId,
        id_divisi: divId,
        id_jabatan: jabId,
        id_unit_kerja: unitId,
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      }).onConflict("id_pengguna").merge();

      userRoleRecords.push({
        id_pengguna: userId,
        id_peran: role.id_peran,
        peran_utama: 1,
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      });

      if (oNavigation) {
        userNavRecords.push({
          id_pengguna: userId,
          menu: oNavigation.menu,
          created_at: dNow,
          updated_at: dNow,
        });
      }
    }
  }

  if (userRoleRecords.length > 0) {
    await knex("mst_pengguna_peran").insert(userRoleRecords).onConflict(["id_pengguna", "id_peran"]).ignore();
  }
  
  if (userNavRecords.length > 0) {
    await knex("navigasi_pengguna").insert(userNavRecords).onConflict("id_pengguna").merge();
  }

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("Demo Organization (5 Dept, 5 Div, 5 Unit & All Roles per Branch) successfully seeded!");
}
