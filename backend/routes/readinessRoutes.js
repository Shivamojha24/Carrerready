const express = require("express");

const {
  saveAssessment,
  getAssessment
} = require("../controllers/readinessController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Save or update the logged-in student's readiness assessment
router.post(
  "/assessment",
  protect,
  authorize("STUDENT"),
  saveAssessment
);

// Get the logged-in student's readiness assessment
router.get(
  "/assessment",
  protect,
  authorize("STUDENT"),
  getAssessment
);

module.exports = router;