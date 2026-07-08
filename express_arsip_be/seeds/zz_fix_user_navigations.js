import { getNavigationMenu } from "../routes/v1/setup/navigation/navigation_helper.js";

export async function seed(knex) {
  console.log("Menjalankan seeder untuk memperbaiki navigasi pengguna...");
  
  // Ambil semua pengguna
  const users = await knex("mst_pengguna").select("id_pengguna", "nama_pengguna");
  let fixedCount = 0;

  for (const user of users) {
    // Generate navigasi berdasarkan peran dari helper
    const nav = await getNavigationMenu(knex, user.id_pengguna);
    
    if (nav && nav.menu && Array.isArray(nav.menu)) {
      // Simpan ke tabel navigasi_pengguna
      await knex("navigasi_pengguna")
        .insert({
          id_pengguna: user.id_pengguna,
          menu: JSON.stringify(nav.menu),
          created_at: new Date(),
          updated_at: new Date()
        })
        .onConflict("id_pengguna")
        .merge({
          menu: JSON.stringify(nav.menu),
          updated_at: new Date()
        });
        
      fixedCount++;
    }
  }

  console.log(`Berhasil memperbarui navigasi untuk ${fixedCount} pengguna.`);
}
