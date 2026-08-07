import "dotenv/config";
import app from "./app.js";

const port = process.env.APP_PORT || 8010;

app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} is already in use`);
      process.exit(1);
    } else {
      throw err;
    }
  });

// Tangkap unhandled promise rejection agar server tidak crash
process.on("unhandledRejection", (reason, promise) => {
  console.error("  Unhandled Rejection at:", promise, "reason:", reason);
});

// Tangkap uncaught exception agar server tidak crash
process.on("uncaughtException", (err) => {
  console.error("  Uncaught Exception:", err);
});
