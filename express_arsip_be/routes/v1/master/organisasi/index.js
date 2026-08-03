import express from "express";

const router = express.Router();

// 1. BRANCHES
import branchGet from "./branches/branch_get.js";
import branchCreate from "./branches/branch_create.js";
import branchUpdate from "./branches/branch_update.js";
import branchDelete from "./branches/branch_delete.js";

router.use("/branches", branchGet);
router.use("/branches", branchCreate);
router.use("/branches", branchUpdate);
router.use("/branches", branchDelete);

// 2. DEPARTMENTS
import departmentGet from "./department/department_get.js";
import departmentCreate from "./department/department_create.js";
import departmentUpdate from "./department/department_update.js";
import departmentDelete from "./department/department_delete.js";

router.use("/department", departmentGet);
router.use("/department", departmentCreate);
router.use("/department", departmentUpdate);
router.use("/department", departmentDelete);

// 3. DIVISIONS
import divisionGet from "./divisions/division_get.js";
import divisionCreate from "./divisions/division_create.js";
import divisionUpdate from "./divisions/division_update.js";
import divisionDelete from "./divisions/division_delete.js";

router.use("/divisions", divisionGet);
router.use("/divisions", divisionCreate);
router.use("/divisions", divisionUpdate);
router.use("/divisions", divisionDelete);

// 4. POSITIONS
import positionGet from "./positions/position_get.js";
import positionCreate from "./positions/position_create.js";
import positionUpdate from "./positions/position_update.js";
import positionDelete from "./positions/position_delete.js";

router.use("/positions", positionGet);
router.use("/positions", positionCreate);
router.use("/positions", positionUpdate);
router.use("/positions", positionDelete);

// 5. WORK UNITS
import workUnitGet from "./work_unit/work_unit_get.js";
import workUnitCreate from "./work_unit/work_unit_create.js";
import workUnitUpdate from "./work_unit/work_unit_update.js";
import workUnitDelete from "./work_unit/work_unit_delete.js";

router.use("/work-unit", workUnitGet);
router.use("/work-unit", workUnitCreate);
router.use("/work-unit", workUnitUpdate);
router.use("/work-unit", workUnitDelete);

// 5. peran
import peranPermissionsGet from "./roles/roles_permissions_get.js";
import peranPermissionsUpdate from "./roles/roles_permissions_update.js";
import peranGet from "./roles/roles_get.js";
import peranCreate from "./roles/roles_create.js";
import peranUpdate from "./roles/roles_update.js";
import peranDelete from "./roles/roles_delete.js";

router.use("/roles/permissions", peranPermissionsGet);
router.use("/roles/permissions", peranPermissionsUpdate);
router.use("/roles", peranGet);
router.use("/roles", peranCreate);
router.use("/roles", peranUpdate);
router.use("/roles", peranDelete);

export default router;

