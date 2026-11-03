const express = require("express");

const {
  createDrive,
  getDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  getStudentDrives
} = require("../controllers/driveController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


/*
=========================================================
PLACEMENT CELL — RECRUITMENT DRIVE MANAGEMENT
=========================================================
*/


// Create recruitment drive
router.post(
  "/",
  protect,
  authorize("PLACEMENT"),
  createDrive
);


// Get all recruitment drives
router.get(
  "/",
  protect,
  authorize("PLACEMENT"),
  getDrives
);


// Student view of recruitment drives
router.get(
  "/student",
  protect,
  authorize("STUDENT"),
  getStudentDrives
);


// Get single recruitment drive
router.get(
  "/:driveId",
  protect,
  authorize("PLACEMENT"),
  getDriveById
);


// Update recruitment drive
router.put(
  "/:driveId",
  protect,
  authorize("PLACEMENT"),
  updateDrive
);


// Delete recruitment drive
router.delete(
  "/:driveId",
  protect,
  authorize("PLACEMENT"),
  deleteDrive
);


module.exports = router;