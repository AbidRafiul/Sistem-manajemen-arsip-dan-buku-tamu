import 'dotenv/config';
import minioClient from '../core/config/minio.js';
import DB from '../core/config/knex.js';
import { getMinioPrefix } from '../core/components/tools/minio_helper.js';

const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'arsip-bucket';

async function seedMinio() {
    try {
        console.log(`Mengecek bucket '${MINIO_BUCKET_NAME}'...`);
        const exists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(MINIO_BUCKET_NAME);
            console.log(`✅ Bucket '${MINIO_BUCKET_NAME}' berhasil dibuat.`);
        } else {
            console.log(`✅ Bucket '${MINIO_BUCKET_NAME}' sudah ada.`);
        }

        console.log('\nMengambil data pengguna dari database...');
        const vaUsers = await DB('mst_pengguna').select('id_pengguna', 'nama_lengkap', 'id_cabang', 'id_departemen', 'id_divisi', 'id_unit_kerja').whereNotNull('id_cabang');
        console.log(`Ditemukan ${vaUsers.length} pengguna.`);

        // Buat dummy file buffer (hanya teks biasa)
        const dummySuratMasuk = Buffer.from("Ini adalah contoh file Surat Masuk hasil generate otomatis.");
        const dummySuratKeluar = Buffer.from("Ini adalah contoh file Surat Keluar hasil generate otomatis.");
        const dummyFotoTamu = Buffer.from("Ini adalah contoh file Foto Tamu (dummy) hasil generate otomatis.");
        const dummyArsipDokumen = Buffer.from("Ini adalah contoh file Arsip Dokumen hasil generate otomatis.");

        let nSuccessCount = 0;

        for (const oUser of vaUsers) {
            const cPrefix = await getMinioPrefix(oUser.id_cabang, oUser.id_departemen, oUser.id_divisi, oUser.id_unit_kerja);
            const nYear = new Date().getFullYear();
            
            // 1. Surat Masuk
            const cSuratMasukPath = `${cPrefix}/korespondensi/surat-masuk/${nYear}/dummy_surat_masuk_user_${oUser.id_pengguna}.txt`;
            await minioClient.putObject(MINIO_BUCKET_NAME, cSuratMasukPath, dummySuratMasuk, dummySuratMasuk.length, { 'Content-Type': 'text/plain' });
            
            // 2. Surat Keluar
            const cSuratKeluarPath = `${cPrefix}/korespondensi/surat-keluar/${nYear}/dummy_surat_keluar_user_${oUser.id_pengguna}.txt`;
            await minioClient.putObject(MINIO_BUCKET_NAME, cSuratKeluarPath, dummySuratKeluar, dummySuratKeluar.length, { 'Content-Type': 'text/plain' });
            
            // 3. Buku Tamu (Foto) - Tanggal hari ini
            const cToday = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const cFotoTamuPath = `${cPrefix}/buku-tamu/foto/${nYear}/${cToday}/dummy_foto_tamu_user_${oUser.id_pengguna}.txt`;
            await minioClient.putObject(MINIO_BUCKET_NAME, cFotoTamuPath, dummyFotoTamu, dummyFotoTamu.length, { 'Content-Type': 'text/plain' });

            // 4. Arsip Dokumen
            const cArsipDokumenPath = `${cPrefix}/arsip-dokumen/${nYear}/dummy_arsip_dokumen_user_${oUser.id_pengguna}.txt`;
            await minioClient.putObject(MINIO_BUCKET_NAME, cArsipDokumenPath, dummyArsipDokumen, dummyArsipDokumen.length, { 'Content-Type': 'text/plain' });

            nSuccessCount += 4;
            console.log(`-> Berhasil menyuntikkan data untuk user: ${oUser.nama_lengkap} (${cPrefix})`);
        }

        console.log(`\n🎉 SELESAI! Berhasil menyuntikkan ${nSuccessCount} file dummy ke MinIO.`);
        await DB.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Terjadi kesalahan:', error);
        await DB.destroy();
        process.exit(1);
    }
}

seedMinio();
