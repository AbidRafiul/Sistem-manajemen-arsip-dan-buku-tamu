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
        const users = await DB('mst_pengguna').select('id_pengguna', 'nama_lengkap', 'id_cabang', 'id_departemen', 'id_divisi', 'id_unit_kerja').whereNotNull('id_cabang');
        console.log(`Ditemukan ${users.length} pengguna.`);

        // Buat dummy file buffer (hanya teks biasa)
        const dummySuratMasuk = Buffer.from("Ini adalah contoh file Surat Masuk hasil generate otomatis.");
        const dummySuratKeluar = Buffer.from("Ini adalah contoh file Surat Keluar hasil generate otomatis.");
        const dummyFotoTamu = Buffer.from("Ini adalah contoh file Foto Tamu (dummy) hasil generate otomatis.");
        const dummyArsipDokumen = Buffer.from("Ini adalah contoh file Arsip Dokumen hasil generate otomatis.");

        let successCount = 0;

        for (const user of users) {
            const prefix = await getMinioPrefix(user.id_cabang, user.id_departemen, user.id_divisi, user.id_unit_kerja);
            
            // 1. Surat Masuk
            const suratMasukPath = `${prefix}/correspondence/surat_masuk/dummy_surat_masuk_user_${user.id_pengguna}.txt`;
            await minioClient.putObject(MINIO_BUCKET_NAME, suratMasukPath, dummySuratMasuk, dummySuratMasuk.length, { 'Content-Type': 'text/plain' });
            
            // 2. Surat Keluar
            const suratKeluarPath = `${prefix}/correspondence/surat_keluar/dummy_surat_keluar_user_${user.id_pengguna}.txt`;
            await minioClient.putObject(MINIO_BUCKET_NAME, suratKeluarPath, dummySuratKeluar, dummySuratKeluar.length, { 'Content-Type': 'text/plain' });
            
            // 3. Buku Tamu (Foto) - Tanggal hari ini
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const fotoTamuPath = `${prefix}/buku-tamu/photos/${today}/dummy_foto_tamu_user_${user.id_pengguna}.txt`;
            await minioClient.putObject(MINIO_BUCKET_NAME, fotoTamuPath, dummyFotoTamu, dummyFotoTamu.length, { 'Content-Type': 'text/plain' });

            // 4. Arsip Dokumen
            const arsipDokumenPath = `${prefix}/arsip_dokumen/dummy_arsip_dokumen_user_${user.id_pengguna}.txt`;
            await minioClient.putObject(MINIO_BUCKET_NAME, arsipDokumenPath, dummyArsipDokumen, dummyArsipDokumen.length, { 'Content-Type': 'text/plain' });

            successCount += 4;
            console.log(`-> Berhasil menyuntikkan data untuk user: ${user.nama_lengkap} (${prefix})`);
        }

        console.log(`\n🎉 SELESAI! Berhasil menyuntikkan ${successCount} file dummy ke MinIO.`);
        await DB.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Terjadi kesalahan:', error);
        await DB.destroy();
        process.exit(1);
    }
}

seedMinio();
