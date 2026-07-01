import minioClient from '../../config/minio.js';

/**
 * Helper untuk upload file ke MinIO.
 * @param {string} bucketName - Nama bucket (contoh: 'berkas-bukutamu')
 * @param {object} file - Objek file dari Multer (req.file)
 * @param {string} [folderPath=""] - Folder tujuan upload (contoh: 'documents' atau 'photos/20260629')
 * @returns {string} - Nama/Path file unik yang berhasil diupload
 */
const uploadFileToMinio = async (bucketName, file, folderPath = "") => {
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
        const baseName = `${uniqueSuffix}.${ext}`;
        const objectName = folderPath ? `${folderPath.replace(/\/$/, '')}/${baseName}` : baseName;

        // 3. Eksekusi upload ke MinIO
        await minioClient.putObject(
            bucketName,
            objectName,
            file.buffer, // Ini butuh Multer memoryStorage
            file.size,
            { 'Content-Type': file.mimetype }
        );

        console.log(`Berhasil upload ${objectName} ke bucket ${bucketName}`);
        
        // 4. Kembalikan nama/path objeknya
        return objectName;
        
    } catch (error) {
        console.error("Gagal upload ke MinIO:", error);
        throw error;
    }
};

/**
 * Helper untuk download file dari MinIO.
 * @param {string} bucketName - Nama bucket
 * @param {string} objectName - Nama objek/file di MinIO
 * @returns {Promise<stream.Readable>} - Stream pembacaan file
 */
const downloadFileFromMinio = async (bucketName, objectName) => {
    try {
        const stream = await minioClient.getObject(bucketName, objectName);
        return stream;
    } catch (error) {
        console.error("Gagal download dari MinIO:", error);
        throw error;
    }
};

export { uploadFileToMinio, downloadFileFromMinio };