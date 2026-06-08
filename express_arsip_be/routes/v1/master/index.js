import express from "express";
import Department from "./department/department.js";

const router = express.Router();

router.use("/department", Department);

export default router;
