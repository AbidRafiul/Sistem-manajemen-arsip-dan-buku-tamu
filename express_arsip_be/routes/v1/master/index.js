import express from "express";
import Department from "./department/department.js";
import Division from "./divisions/divisions.js";
import Branch from "./branches/branches.js"
import Position from "./positions/position.js";
import WorkUnit from "./work_unit/work_unit.js";


const router = express.Router();

router.use("/department", Department);
router.use("/divisions", Division);
router.use("/branches", Branch);
router.use("/positions", Position);
router.use("/work-unit", WorkUnit);

export default router;
