import "dotenv/config";
import { hmac, formatDateSystem } from "../routes/v1/components/tools/general.js";

export async function seed(knex) {
  const username = "superadmin@admin.com";
  const fullname = "Superadmin";
  const telp = "08100000000";
  const password = "Superadmin321!";
  
  // Asumsi: RoleId untuk Superadmin di tabel mst_roles adalah 1
  const roleId = 1; 

  // 1. CARI USER LAMA (Berdasarkan Username di mst_users)
  const existingUser = await knex('mst_users').where('Username', username).first();

  if (existingUser) {
    // Hapus relasi anak-anaknya dulu pakai UserId
    await knex('mst_user_roles').where('UserId', existingUser.UserId).del();
    await knex('user_navigation').where('UserId', existingUser.UserId).del();
    // Baru hapus induknya
    await knex('mst_users').where('UserId', existingUser.UserId).del();
  }

  // Hashing Password baru
  const cPassword = process.env.USER_KEY + username + password;
  const dDatetime = formatDateSystem();
  const secret = process.env.USER_SECRET;
  const hashedPassword = hmac(cPassword, secret, 'sha512');

  // 2. TANAM KE mst_users & TANGKAP UserId-nya
  const [insertedUserId] = await knex("mst_users").insert({
    Fullname: fullname,
    Username: username,
    Telp: telp,
    Password: hashedPassword,
    Status: "active", 
    BranchId: 1,
    DivisionId: 1,
    DepartmentId: 1,
    PositionId: 1,
    WorkUnitId: 1,
    CreatedAt: dDatetime,
    UpdatedAt: dDatetime,
  });

  // 3. TANAM KE mst_user_roles (Sesuai struktur screenshot lo)
  await knex("mst_user_roles").insert({
    UserId: insertedUserId, 
    RoleId: roleId,
    IsPrimary: 1,      // Dari screenshot ada kolom ini
    Status: 'active',  // Sesuaikan tipe datanya, kalau INT ganti jadi 1
    CreatedAt: dDatetime,
    UpdatedAt: dDatetime
  });

  // 4. TANAM KE user_navigation (PENTING: Pastikan lo udah ganti UniqueId jadi UserId di DB)
  const oNavigation = await knex("mst_navigation").where("Role", "Master").first();

  if (oNavigation) {
    await knex("user_navigation").insert({
      UserId: insertedUserId, // Sekarang sudah pakai UserId relasional yang benar
      Menu: oNavigation.Menu,
      CreatedAt: dDatetime,
      UpdatedAt: dDatetime,
    });
  }
}
