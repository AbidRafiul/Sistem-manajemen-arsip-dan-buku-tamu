export async function seed(knex) {
  // 1. MATIKAN Cek Foreign Key
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');

  // 2. BERSIHKAN TABEL
  await knex('mst_departments').del();
  await knex('mst_divisions').del();
  await knex('mst_branches').del();
  await knex('user_credential').del();

  // 3. HIDUPKAN kembali Foreign Key Check
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');

  // 4. Masukkan data Master (BAPAK ke ANAK)
  
  // Masukkan 2 Branch (Pusat & Cabang)
  await knex('mst_branches').insert([
    { 
      BranchId: 1, 
      BranchCode: 'BR-001', 
      BranchName: 'Kantor Pusat', 
      Status: 'active', 
      CreatedAt: new Date(), 
      UpdatedAt: new Date() 
    },
    { 
      BranchId: 2, 
      BranchCode: 'BR-002', 
      BranchName: 'Kantor Cabang', 
      Status: 'active', 
      CreatedAt: new Date(), 
      UpdatedAt: new Date() 
    }
  ]);

  // Masukkan Divisi (Mengacu ke BranchId yang sudah ada di atas)
  await knex('mst_divisions').insert([
    { 
      DivisionId: 1, 
      BranchId: 1, // Masuk ke Kantor Pusat
      DivisionCode: 'DIV-IT', 
      DivisionName: 'Information Technology', 
      Status: 'active', 
      CreatedAt: new Date(), 
      UpdatedAt: new Date() 
    },
    { 
      DivisionId: 2, 
      BranchId: 2,
      DivisionCode: 'DIV-KES', 
      DivisionName: 'Kesehatan', 
      Status: 'active', 
      CreatedAt: new Date(), 
      UpdatedAt: new Date() 
    },
    { 
      DivisionId: 3, 
      BranchId: 1,
      DivisionCode: 'DIV-ELEKTRO', 
      DivisionName: 'Elektro', 
      Status: 'active', 
      CreatedAt: new Date(), 
      UpdatedAt: new Date() 
    },
    { 
      DivisionId: 4, 
      BranchId: 1,
      DivisionCode: 'DIV-LISTRIK', 
      DivisionName: 'Listrik', 
      Status: 'active', 
      CreatedAt: new Date(), 
      UpdatedAt: new Date() 
    },
     { 
      DivisionId: 5, 
      BranchId: 2,
      DivisionCode: 'SDM', 
      DivisionName: 'Sumber Daya Manusia', 
      Status: 'active', 
      CreatedAt: new Date(), 
      UpdatedAt: new Date() 
    },
    { 
      DivisionId: 6, 
      BranchId: 1,
      DivisionCode: 'CS', 
      DivisionName: 'Customer Service', 
      Status: 'active', 
      CreatedAt: new Date(), 
      UpdatedAt: new Date() 
    }
  ]);
};