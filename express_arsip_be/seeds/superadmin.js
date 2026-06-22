import crypto from 'crypto';

// 1. Definisikan fungsi hmac agar tidak error "not defined"
function hmac(data, key, algorithm = 'sha512') {
    return crypto.createHmac(algorithm, key).update(data).digest('hex');
}

// 2. Definisikan fungsi formatDateSystem untuk format tanggal MariaDB
function formatDateSystem() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export async function seed(knex) {
  const username = "superadmin@admin.com";
  const fullname = "Superadmin";
  const telp = "08100000000";
  const password = "Superadmin321!";
  
  const roleId = 1; 

  // 1. CARI USER LAMA (Ubah 'Username' menjadi 'username')
  const existingUser = await knex('mst_users').where('username', username).first();

  if (existingUser) {
    // Hapus relasi anak-anaknya dulu (Ubah ke user_id dan unique_id sesuai migrasi tabel)
    await knex('mst_user_roles').where('user_id', existingUser.user_id).del();
    await knex('user_navigation').where('unique_id', existingUser.user_id).del();
    
    // Baru hapus induknya
    await knex('mst_users').where('user_id', existingUser.user_id).del();
  }

  // Hashing Password baru
  const cPassword = process.env.USER_KEY + username + password;
  const dDatetime = formatDateSystem();
  const secret = process.env.USER_SECRET;
  const hashedPassword = hmac(cPassword, secret, 'sha512');

  // 2. TANAM KE mst_users & TANGKAP user_id-nya
  const [insertedUserId] = await knex("mst_users").insert({
    fullname: fullname,
    username: username,
    telp: telp,
    password: hashedPassword,
    status: "active", 
    branch_id: 1,
    division_id: 1,
    department_id: 1, // Diperbaiki dari departemen_id menjadi department_id agar sesuai nama tabel mst_departments
    position_id: 1,
    work_unit_id: 1,
    created_at: dDatetime,
    updated_at: dDatetime,
  });

  // 3. TANAM KE mst_user_roles 
  await knex("mst_user_roles").insert({
    user_id: insertedUserId, 
    role_id: roleId,
    is_primary: 1,      
    status: 'active',  
    created_at: dDatetime,
    updated_at: dDatetime
  });

  // 4. TANAM KE user_navigation (Ubah 'Role' menjadi 'role' & 'Menu' menjadi 'menu')
  const oNavigation = await knex("mst_navigation").where("role", "Master").first();

  if (oNavigation) {
    await knex("user_navigation").insert({
      user_id: insertedUserId, // Sesuai struktur tabel user_navigation yang menggunakan unique_id
      menu: oNavigation.menu,
      created_at: dDatetime,
      updated_at: dDatetime,
    });
  }
}