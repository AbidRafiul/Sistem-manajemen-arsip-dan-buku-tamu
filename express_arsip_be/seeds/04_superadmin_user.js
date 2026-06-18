import { hmac, formatDateSystem } from "../routes/v1/components/tools/general.js";

export async function seed(knex) {
  // 1. Matikan Foreign Key check
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');

  const dNow = new Date();
  const cDatetime = formatDateSystem();

  // 2. Pastikan Master Data Organisasi Lengkap (Department, Position, WorkUnit)
  // Branch & Division sudah diisi di 01_master_data.js (BranchId: 1, DivisionId: 1)
  
  await knex('mst_departments').insert([
    { DepartmentId: 1, DivisionId: 1, DepartmentCode: 'DEPT-IT', DepartmentName: 'IT Department', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow }
  ]).onConflict('DepartmentId').ignore();

  await knex('mst_positions').insert([
    { PositionId: 1, PositionCode: 'POS-DIR', PositionName: 'Direktur Utama', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow }
  ]).onConflict('PositionId').ignore();

  await knex('mst_work_units').insert([
    { WorkUnitId: 1, DepartmentId: 1, WorkUnitCode: 'WU-DIR', WorkUnitName: 'Direktorat Utama', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow }
  ]).onConflict('WorkUnitId').ignore();

  // 3. Hapus data superadmin lama jika ada
  await knex('mst_user_roles').where('UserId', 1).del();
  await knex('mst_users').where('Username', 'superadmin@admin.com').del();
  await knex('user_credential').where('UniqueId', 'USR000000').del();

  // 4. Masukkan Superadmin ke `mst_users` (Sistem Baru SIAB)
  const [userId] = await knex('mst_users').insert([{
    UserId: 1,
    Fullname: 'Superadmin SIAB',
    Username: 'superadmin@admin.com',
    Email: 'superadmin@admin.com',
    Telp: '08100000000',
    Password: 'hashed_placeholder', // Akan login lewat user_credential, ini dummy
    BranchId: 1,
    DivisionId: 1,
    DepartmentId: 1,
    PositionId: 1,
    WorkUnitId: 1,
    Status: 'active',
    CreatedAt: dNow,
    UpdatedAt: dNow
  }]);

  // 5. Masukkan Role Superadmin ke `mst_user_roles`
  // Asumsi RoleId 1 adalah ADM dari 03_mst_roles.js
  const roleAdmin = await knex('mst_roles').where('RoleCode', 'ADM').first();
  if (roleAdmin) {
    await knex('mst_user_roles').insert([{
      UserId: 1,
      RoleId: roleAdmin.RoleId,
      IsPrimary: 1,
      Status: 'active',
      CreatedAt: dNow,
      UpdatedAt: dNow
    }]);
  }

  // 6. Masukkan Superadmin ke `user_credential` (Sistem Auth Lama / Middleware)
  const uniqueId = "USR000000";
  const passwordClear = "Superadmin321!";
  
  const cPassword = process.env.USER_KEY + uniqueId + passwordClear;
  const secret = process.env.USER_SECRET;
  const hashedPassword = hmac(cPassword, secret, 'sha512');

  await knex("user_credential").insert({
    Id: 1,
    UniqueId: uniqueId,
    Username: 'superadmin@admin.com',
    Fullname: 'Superadmin SIAB',
    Telp: '08100000000',
    Role: 'superadmin',
    Status: '1',
    Password: hashedPassword,
    CreatedAt: cDatetime,
    UpdatedAt: cDatetime,
  });

  // 7. Hidupkan Foreign Key check
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
}
