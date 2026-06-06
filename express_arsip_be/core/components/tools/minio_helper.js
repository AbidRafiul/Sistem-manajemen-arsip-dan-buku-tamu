import minioClient from '../../config/minio.js';

/**
 * Helper untuk upload file ke MinIO.
 * Catatan untuk tim: Pastikan route kalian menggunakan middleware Multer dengan memoryStorage()
 * @param {string} bucketName - Nama bucket (contoh: 'berkas-bukutamu')
 * @param {object} file - Objek file dari Multer (req.file)
 * @returns {string} - Nama file unik yang berhasil diupload
 */
const uploadFileToMinio = async (bucketName, file) => {
    try {
        // 1. Cek apakah bucket-nya sudah ada, kalau belum biar otomatis dibikinin
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName);
            console.log(`Bucket '${bucketName}' berhasil dibuat.`);
        }

        // 2. Bikin nama file unik biar gak bentrok kalau ada file bernama sama
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        const fileName = `${uniqueSuffix}.${ext}`;

        // 3. Eksekusi upload ke MinIO
        await minioClient.putObject(
            bucketName,
            fileName,
            file.buffer, // Ini butuh Multer memoryStorage
            file.size,
            { 'Content-Type': file.mimetype }
        );

        console.log(`Berhasil upload ${fileName} ke bucket ${bucketName}`);
        
        // 4. Kembalikan nama filenya aja buat disimpen ke tabel database MySQL
        return fileName;
        
    } catch (error) {
        console.error("Gagal upload ke MinIO:", error);
        throw error;
    }
};

export {uploadFileToMinio};