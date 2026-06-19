import { hmac, formatDateSystem } from "../routes/v1/components/tools/general.js";

export async function seed(knex) {
  // 1. Matikan Foreign Key check
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');

  const dNow = new Date();
  const cDatetime = formatDateSystem();

  // 2. Pastikan Master Data Organisasi Lengkap (Department, Position, WorkUnit)
  // Branch & Division sudah diisi di 01_master_data.js (branch_id: 1, division_id: 1)
  
  await knex('mst_departments').insert([
    { department_id: 1, division_id: 1, department_code: 'DEPT-IT', department_name: 'IT Department', status: 'active', created_at: dNow, updated_at: dNow }
  ]).onConflict('department_id').ignore();

  await knex('mst_positions').insert([
    { position_id: 1, position_code: 'POS-DIR', position_name: 'Direktur Utama', status: 'active', created_at: dNow, updated_at: dNow }
  ]).onConflict('position_id').ignore();

  await knex('mst_work_units').insert([
    { work_unit_id: 1, department_id: 1, work_unit_code: 'WU-DIR', work_unit_name: 'Direktorat Utama', status: 'active', created_at: dNow, updated_at: dNow }
  ]).onConflict('work_unit_id').ignore();

  // 3. Hapus data superadmin lama jika ada
  await knex('mst_user_roles').where('user_id', 1).del();
  await knex('mst_users').where('username', 'superadmin@admin.com').del();

  const username = 'superadmin@admin.com';
  const passwordClear = 'Superadmin321!';
  
  const cPassword = process.env.USER_KEY + username + passwordClear;
  const secret = process.env.USER_SECRET;
  const hashedPassword = hmac(cPassword, secret, 'sha512');

  // 4. Masukkan Superadmin ke `mst_users` (Sistem Baru SIAB)
  const [userId] = await knex('mst_users').insert([{
    user_id: 1,
    fullname: 'Superadmin SIAB',
    username: username,
    email: username,
    telp: '08100000000',
    password: hashedPassword,
    branch_id: 1,
    division_id: 1,
    department_id: 1,
    position_id: 1,
    work_unit_id: 1,
    status: 'active',
    created_at: dNow,
    updated_at: dNow
  }]);

  // 5. Masukkan Role Superadmin ke `mst_user_roles`
  // Asumsi RoleId 1 adalah ADM dari 03_mst_roles.js
  const roleAdmin = await knex('mst_roles').where('role_code', 'ADM').first();
  if (roleAdmin) {
    await knex('mst_user_roles').insert([{
      user_id: 1,
      role_id: roleAdmin.role_id,
      is_primary: 1,
      status: 'active',
      created_at: dNow,
      updated_at: dNow
    }]);
  }

  // 6. Masukkan Superadmin ke `user_navigation`
  const oNavigation = await knex("mst_navigation").where("role", "master").first();
  if (oNavigation) {
    await knex("user_navigation").insert({
      user_id: 1,
      menu: oNavigation.menu,
      created_at: dNow,
      updated_at: dNow,
    }).onConflict('user_id').merge({
      menu: oNavigation.menu,
      updated_at: dNow
    });
  }

  // 7. Hidupkan Foreign Key check
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
}
