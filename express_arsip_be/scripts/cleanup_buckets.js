import 'dotenv/config';
import minioClient from '../core/config/minio.js';

async function deleteBucketAndContents(bucketName) {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            console.log(`Bucket '${bucketName}' tidak ditemukan (sudah terhapus).`);
            return;
        }

        console.log(`Menghapus isi bucket '${bucketName}'...`);
        const objectsList = [];
        const stream = minioClient.listObjects(bucketName, '', true);
        
        for await (const obj of stream) {
            objectsList.push(obj.name);
        }

        if (objectsList.length > 0) {
            await minioClient.removeObjects(bucketName, objectsList);
            console.log(`Berhasil menghapus ${objectsList.length} file dari '${bucketName}'.`);
        }

        console.log(`Menghapus bucket '${bucketName}'...`);
        await minioClient.removeBucket(bucketName);
        console.log(`✅ Bucket '${bucketName}' berhasil dihapus secara permanen!`);
    } catch (error) {
        console.error(`❌ Gagal menghapus bucket '${bucketName}':`, error.message);
    }
}

async function runCleanup() {
    console.log("Memulai proses penghapusan bucket lama...");
    const bucketsToDelete = ['berkas-arsip', 'berkas-bukutamu', 'berkas-persuratan'];
    
    for (const bucket of bucketsToDelete) {
        await deleteBucketAndContents(bucket);
    }
    
    console.log("\n🎉 SELESAI! Semua bucket lama berhasil dibersihkan.");
    process.exit(0);
}

runCleanup();
