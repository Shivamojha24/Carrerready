const express = require("express");

const {
  protect
} = require("../middleware/authMiddleware");

const {
  authorize
} = require("../middleware/roleMiddleware");

const {
  promoteStudent,
  getStudentProgress
} = require("../controllers/progressionController");

const router = express.Router();

// ============================================================
// GET STUDENT ACADEMIC PROGRESS
// ============================================================

router.get(
  "/:studentId",
  protect,
  authorize("MENTOR", "PLACEMENT"),
  getStudentProgress
);


// ============================================================
// PROMOTE STUDENT
// ============================================================

router.post(
  "/:studentId/promote",
  protect,
  authorize("MENTOR", "PLACEMENT"),
  promoteStudent
);

module.exports = router;