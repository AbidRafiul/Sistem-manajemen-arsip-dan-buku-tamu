import express from "express";
import Department from "./department/department.js";
import Division from "./divisions/divisions.js";
import Branch from "./branches/branches.js"

const router = express.Router();

router.use("/department", Department);
router.use("/divisions", Division);
router.use("/branches", Branch)

export default router;
