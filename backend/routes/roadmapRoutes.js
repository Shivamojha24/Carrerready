const express = require("express");

const {
  getStudentRoadmap,
  createMentorRecommendation,
  getMentorRecommendations,
  generateStudentRoadmap
} = require("../controllers/roadmapController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// STUDENT ROADMAP
// ======================================================

router.get(
  "/",
  protect,
  authorize("STUDENT"),
  getStudentRoadmap
);


// ======================================================
// AI ROADMAP
// ======================================================

router.post(
  "/ai",
  protect,
  authorize("STUDENT"),
  generateStudentRoadmap
);


// ======================================================
// MENTOR CREATE RECOMMENDATION
// ======================================================

router.post(
  "/mentor-recommendations",
  protect,
  authorize("MENTOR"),
  createMentorRecommendation
);


// ======================================================
// MENTOR VIEW RECOMMENDATIONS
// ======================================================

router.get(
  "/mentor-recommendations/:studentId",
  protect,
  authorize("MENTOR"),
  getMentorRecommendations
);


module.exports = router;