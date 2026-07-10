import cors from "cors";
import express from "express";

import APIV1 from "./routes/v1/index.js";

import { formatDateSystem } from "./routes/v1/components/tools/general.js";
import { validateTimestamp } from "./middleware/validate_header.js";
import { useragentMiddleware } from "./middleware/allow_user_agent.js";
import secureHeader from "./middleware/secure_header.js";
import Logger from "./middleware/logger.js";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN1 || "http://localhost:3000",
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Timestamp",
      "x-timestamp",
      "X-Uniqueid",
      "x-uniqueid",
      "X-Signature",
      "X-Credential",
      "X-Endpoint",
      "X-ENDPOINT",
      "x-endpoint",
      "x-level",
      "x-access-token",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    optionSuccessStatus: 200,
  }),
);

app.use(Logger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

//  2. MATIKAN SEMENTARA VALIDATOR TIMESTAMP GLOBAL AGAR TIDAK REPOT DI POSTMAN/FRONTEND
app.use(
  "/api/v1",
  [secureHeader], // Kita lepas dulu validateTimestamp yang bikin oranye "Missing timestamp header"
  APIV1,
);

app.use("/uploads", express.static("public/uploads"));

app.use((req, res, next) => {
  console.log(req.url);
  return res.status(404).json({
    status: "404",
    message: "Endpoint tidak ditemukan",
    datetime: formatDateSystem(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "Ukuran file terlalu besar. Melebihi batas yang diizinkan.",
      });
    }
    return res.status(400).json({
      status: "error",
      message: `Gagal mengunggah file: ${err.message}`,
    });
  }

  console.error("Unhandled Server Error:", err);
  return res.status(500).json({
    status: "error",
    message: err.message || "Terjadi kesalahan internal pada server",
  });
});

export default app;
