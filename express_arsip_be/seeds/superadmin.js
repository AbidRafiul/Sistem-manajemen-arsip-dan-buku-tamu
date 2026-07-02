import crypto from "crypto";

const hmac = (data, key, algorithm = "sha512") => {
  return crypto.createHmac(algorithm, key).update(data).digest("hex");
};

export async function seed(knex) {
  const username = "superadmin@admin.com";
  const dNow = new Date();
  const password = hmac(
    `${process.env.USER_KEY}${username}Superadmin321!`,
    process.env.USER_SECRET,
    "sha512",
  );

  const existingUser = await knex("mst_pengguna")
    .where("nama_pengguna", username)
    .first();
  const userPayload = {
    nama_lengkap: "Superadmin",
    nama_pengguna: username,
    surel: username,
    telepon: "08100000000",
    kata_sandi: password,
    status: "active",
    id_cabang: 1,
    id_divisi: 1,
    id_departemen: 1,
    id_jabatan: 1,
    id_unit_kerja: 1,
    updated_at: dNow,
  };

  let userId = existingUser?.id_pengguna;
  if (existingUser) {
    await knex("mst_pengguna")
      .where("id_pengguna", existingUser.id_pengguna)
      .update(userPayload);
  } else {
    const [insertedId] = await knex("mst_pengguna").insert({
      ...userPayload,
      created_at: dNow,
    });
    userId = insertedId;
  }

  const adminRole = await knex("mst_peran")
    .where("kode_peran", "ADM")
    .first();
  if (!adminRole) {
    throw new Error("Peran ADM belum tersedia untuk seed superadmin");
  }

  const existingRole = await knex("mst_pengguna_peran")
    .where("id_pengguna", userId)
    .first();
  const rolePayload = {
    id_pengguna: userId,
    id_peran: adminRole.id_peran,
    peran_utama: 1,
    status: "active",
    updated_at: dNow,
  };

  if (existingRole) {
    await knex("mst_pengguna_peran")
      .where("id_peran_pengguna", existingRole.id_peran_pengguna)
      .update(rolePayload);
  } else {
    await knex("mst_pengguna_peran").insert({
      ...rolePayload,
      created_at: dNow,
    });
  }

  const navigation = await knex("mst_navigasi")
    .where("peran", "master")
    .first();
  if (navigation) {
    await knex("user_navigation")
      .insert({
        id_pengguna: userId,
        menu: navigation.menu,
        created_at: dNow,
        updated_at: dNow,
      })
      .onConflict("id_pengguna")
      .merge({
        menu: navigation.menu,
        updated_at: dNow,
      });
  }
}
