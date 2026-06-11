import multer from "multer";
import fs from "fs";
import path from "path";

const cUploadPath = path.join(process.cwd(), "public", "uploads", "documents");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(cUploadPath)) {
      fs.mkdirSync(cUploadPath, { recursive: true });
    }

    cb(null, cUploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const vaAllowedMimeType = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (vaAllowedMimeType.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Tipe file tidak diizinkan"), false);
};

export const uploadDocument = multer({
  storage,
  fileFilter,
}).single("file");
