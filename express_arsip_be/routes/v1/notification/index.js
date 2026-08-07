import express from "express";
import getNotification from "./notification_get.js";
import markReadNotification from "./notification_mark_read.js";

const router = express.Router();

router.use("/", getNotification);
router.use("/", markReadNotification);

export default router;
