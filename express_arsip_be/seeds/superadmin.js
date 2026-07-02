import crypto from "crypto";

const hmac = (data, key, algorithm = "sha512") => {
  return crypto.createHmac(algorithm, key).update(data).digest("hex");
};

export async function seed(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");
  const id_pengguna = "1";
  const nama_lengkap = "Superadmin";
  const telepon = "08100000000";
  const kata_sandi = "Superadmin321!";

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

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
