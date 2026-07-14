/**
 * Helper untuk menerapkan isolasi data multi-tenancy.
 * Jika pengguna adalah SUPERADMIN, ia akan membaca X-Filter-* dari request headers (jika ada).
 * Jika bukan SUPERADMIN, ia akan memaksa query menggunakan ID organisasi asli milik user (dari req.context).
 */
export const applyMultiTenantFilter = (queryBuilder, req, userTableAlias = 'mst_pengguna') => {
    if (!req.context) return; // Fallback jika tidak ada context

    const isSuperAdmin = req.auth?.peranCode === 'SUPERADMIN';

    if (isSuperAdmin) {
        // Mode Pemantauan Pusat (Menggunakan Dropdown Global Filter)
        const fCabang = req.headers['x-filter-cabang'];
        const fDepartemen = req.headers['x-filter-departemen'];
        const fDivisi = req.headers['x-filter-divisi'];
        const fUnitKerja = req.headers['x-filter-unit-kerja'];

        if (fCabang && fCabang !== 'null') queryBuilder.whereIn(`${userTableAlias}.id_cabang`, String(fCabang).split(","));
        if (fDepartemen && fDepartemen !== 'null') queryBuilder.where(`${userTableAlias}.id_departemen`, fDepartemen);
        if (fDivisi && fDivisi !== 'null') queryBuilder.where(`${userTableAlias}.id_divisi`, fDivisi);
        if (fUnitKerja && fUnitKerja !== 'null') queryBuilder.where(`${userTableAlias}.id_unit_kerja`, fUnitKerja);
    } else {
        // Mode Cabang (Isolasi Data Strict, membaca profil pengguna login dan header filter paksa)
        const ctx = req.context;
        const fCabang = req.headers['x-filter-cabang'];
        if (fCabang && fCabang !== 'null') queryBuilder.whereIn(`${userTableAlias}.id_cabang`, String(fCabang).split(","));
        else if (ctx.id_cabang) queryBuilder.where(`${userTableAlias}.id_cabang`, ctx.id_cabang); // Fallback
        if (ctx.id_departemen) queryBuilder.where(`${userTableAlias}.id_departemen`, ctx.id_departemen);
        if (ctx.id_divisi) queryBuilder.where(`${userTableAlias}.id_divisi`, ctx.id_divisi);
        if (ctx.id_unit_kerja) queryBuilder.where(`${userTableAlias}.id_unit_kerja`, ctx.id_unit_kerja);
    }

    return queryBuilder;
};
