const express = require("express");

const {
  protect
} = require("../middleware/authMiddleware");

const {
  authorize
} = require("../middleware/roleMiddleware");

const {
  getAllStudents,
  getStudentById,
  promoteStudent,
  getStudentProgress
} = require("../controllers/mentorController");

const router = express.Router();

// ============================================================
// MENTOR - GET ALL STUDENTS
// ============================================================

router.get(
  "/students",
  protect,
  authorize("MENTOR"),
  getAllStudents
);

// ============================================================
// MENTOR - GET SINGLE STUDENT
// ============================================================

router.get(
  "/students/:studentId",
  protect,
  authorize("MENTOR"),
  getStudentById
);

// ============================================================
// MENTOR - GET STUDENT PROGRESS
// ============================================================

router.get(
  "/students/:studentId/progress",
  protect,
  authorize("MENTOR"),
  getStudentProgress
);

// ============================================================
// MENTOR - PROMOTE STUDENT
// ============================================================

router.post(
  "/students/:studentId/promote",
  protect,
  authorize("MENTOR"),
  promoteStudent
);

module.exports = router;