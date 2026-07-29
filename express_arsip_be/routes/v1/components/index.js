import express from "express";

const router = express.Router();
import getLastFaktur from "./endpoint/get_last_faktur.js";
import dbConfig from "./endpoint/db_config.js";

router.use("/get-last-faktur", getLastFaktur);
router.use("/db-config", dbConfig);

export default router;
