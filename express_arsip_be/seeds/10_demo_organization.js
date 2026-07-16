import { hmac } from "../routes/v1/components/tools/general.js";

export async function seed(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  const dNow = new Date();
  const secret = process.env.USER_SECRET;

  const peranBiasa = await knex("mst_peran").where("nama_peran", "Admin").first();
  const oNavigation = await knex("mst_navigasi").where("peran", "master").first();

  const newBranches = [
    // 4 Tambahan Pusat Cabang (id_induk = 1 for Pusat Jakarta)
    { id_cabang: 5, id_induk: 1, kode_cabang: "BR-005", nama_cabang: "Pusat Bandung", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 6, id_induk: 1, kode_cabang: "BR-006", nama_cabang: "Pusat Semarang", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 7, id_induk: 1, kode_cabang: "BR-007", nama_cabang: "Pusat Yogyakarta", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 8, id_induk: 1, kode_cabang: "BR-008", nama_cabang: "Pusat Bali", status: "active", created_at: dNow, updated_at: dNow },
    
    // 10 Cabang Daerah (Tersebar)
    { id_cabang: 9, id_induk: 2, kode_cabang: "BR-009", nama_cabang: "Cabang Mojokerto", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 10, id_induk: 2, kode_cabang: "BR-010", nama_cabang: "Cabang Sidoarjo", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 11, id_induk: 5, kode_cabang: "BR-011", nama_cabang: "Cabang Cimahi", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 12, id_induk: 5, kode_cabang: "BR-012", nama_cabang: "Cabang Soreang", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 13, id_induk: 6, kode_cabang: "BR-013", nama_cabang: "Cabang Demak", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 14, id_induk: 6, kode_cabang: "BR-014", nama_cabang: "Cabang Kendal", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 15, id_induk: 7, kode_cabang: "BR-015", nama_cabang: "Cabang Bantul", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 16, id_induk: 7, kode_cabang: "BR-016", nama_cabang: "Cabang Sleman", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 17, id_induk: 8, kode_cabang: "BR-017", nama_cabang: "Cabang Denpasar", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 18, id_induk: 8, kode_cabang: "BR-018", nama_cabang: "Cabang Gianyar", status: "active", created_at: dNow, updated_at: dNow },

    // 10 Unit Kecamatan
    { id_cabang: 19, id_induk: 9, kode_cabang: "BR-019", nama_cabang: "Kecamatan Mojokerto Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 20, id_induk: 10, kode_cabang: "BR-020", nama_cabang: "Kecamatan Sidoarjo Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 21, id_induk: 11, kode_cabang: "BR-021", nama_cabang: "Kecamatan Cimahi Tengah", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 22, id_induk: 12, kode_cabang: "BR-022", nama_cabang: "Kecamatan Soreang Pusat", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 23, id_induk: 13, kode_cabang: "BR-023", nama_cabang: "Kecamatan Demak Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 24, id_induk: 14, kode_cabang: "BR-024", nama_cabang: "Kecamatan Kendal Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 25, id_induk: 15, kode_cabang: "BR-025", nama_cabang: "Kecamatan Bantul Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 26, id_induk: 16, kode_cabang: "BR-026", nama_cabang: "Kecamatan Sleman Kota", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 27, id_induk: 17, kode_cabang: "BR-027", nama_cabang: "Kecamatan Denpasar Selatan", status: "active", created_at: dNow, updated_at: dNow },
    { id_cabang: 28, id_induk: 18, kode_cabang: "BR-028", nama_cabang: "Kecamatan Gianyar Kota", status: "active", created_at: dNow, updated_at: dNow },
  ];
  
  await knex("mst_cabang").insert(newBranches).onConflict("id_cabang").merge();

  const allBranchesToLoop = await knex("mst_cabang").where("id_cabang", ">", 1).orderBy("id_cabang", "asc");

  const departemens = allBranchesToLoop.map(b => ({
    id_departemen: b.id_cabang + 2, 
    id_cabang: b.id_cabang,
    kode_departemen: "DEPT-" + b.id_cabang,
    nama_departemen: "Operasional " + b.nama_cabang,
    status: "active",
    created_at: dNow,
    updated_at: dNow
  }));
  await knex("mst_departemen").insert(departemens).onConflict("id_departemen").merge();

  const divisis = allBranchesToLoop.map(b => ({
    id_divisi: b.id_cabang + 2,
    id_departemen: b.id_cabang + 2,
    kode_divisi: "DIV-" + b.id_cabang,
    nama_divisi: "Divisi " + b.nama_cabang,
    status: "active",
    created_at: dNow,
    updated_at: dNow
  }));
  await knex("mst_divisi").insert(divisis).onConflict("id_divisi").merge();

  const units = allBranchesToLoop.map(b => ({
    id_unit_kerja: b.id_cabang + 2,
    id_divisi: b.id_cabang + 2,
    kode_unit_kerja: "UNIT-" + b.id_cabang,
    nama_unit_kerja: "Unit " + b.nama_cabang,
    status: "active",
    created_at: dNow,
    updated_at: dNow
  }));
  await knex("mst_unit_kerja").insert(units).onConflict("id_unit_kerja").merge();

  const userRoleRecords = [];
  const userNavRecords = [];
  
  for (const b of allBranchesToLoop) {
    const username = "admin." + b.id_cabang + "@admin.com";
    const userpwd = hmac(process.env.USER_KEY + username + "Admin123!", secret, "sha512");
    
    await knex("mst_pengguna").where("nama_pengguna", username).del();
    
    const userId = b.id_cabang + 5;
    await knex("mst_pengguna").insert({
      id_pengguna: userId,
      nama_lengkap: "Admin " + b.nama_cabang,
      nama_pengguna: username,
      surel: username,
      telepon: "08" + (Math.floor(Math.random() * 90000000) + 10000000),
      kata_sandi: userpwd,
      id_cabang: b.id_cabang,
      id_divisi: b.id_cabang + 2,
      id_departemen: b.id_cabang + 2,
      id_jabatan: 2, // Manager
      id_unit_kerja: b.id_cabang + 2,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    }).onConflict("id_pengguna").merge();
    
    if (peranBiasa) {
      userRoleRecords.push({
        id_pengguna: userId,
        id_peran: peranBiasa.id_peran,
        peran_utama: 1,
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      });
    }
    
    if (oNavigation) {
      userNavRecords.push({
        id_pengguna: userId,
        menu: oNavigation.menu,
        created_at: dNow,
        updated_at: dNow,
      });
    }
  }

  if (userRoleRecords.length > 0) {
    await knex("mst_pengguna_peran").insert(userRoleRecords).onConflict(["id_pengguna", "id_peran"]).ignore();
  }
  
  if (userNavRecords.length > 0) {
    await knex("navigasi_pengguna").insert(userNavRecords).onConflict("id_pengguna").merge();
  }

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("Demo Organization (Surabaya & Madiun) successfully seeded!");
}
