import "dotenv/config";
import * as Minio from "minio";

const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
const secretKey = process.env.MINIO_SECRET_KEY || "minioadmin";
const endpoint = process.env.MINIO_ENDPOINT || "localhost";
const port = parseInt(process.env.MINIO_PORT || "9000", 10);

console.log(`Connecting to MinIO at ${endpoint}:${port} with key="${accessKey}"...`);

const minioClient = new Minio.Client({
  endPoint: endpoint,
  port: port,
  useSSL: false,
  accessKey: accessKey,
  secretKey: secretKey,
});

try {
  const buckets = await minioClient.listBuckets();
  console.log("✅ MinIO connection SUCCESS! Buckets:", buckets);
} catch (e) {
  console.error("❌ MinIO connection FAILED:", e.message);
  console.error("Code:", e.code);
}
