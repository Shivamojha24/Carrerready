const express = require("express");
const router = express.Router();

const {
  getReadinessDashboard,
  getSkillGapSummary,
  getApplicationSummary
} = require("../controllers/placementDashboardController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

// Placement Cell readiness dashboard
router.get(
  "/readiness",
  protect,
  authorize("PLACEMENT"),
  getReadinessDashboard
);

// Placement Cell skill-gap summary
router.get(
  "/skill-gaps",
  protect,
  authorize("PLACEMENT"),
  getSkillGapSummary
);

// Placement Cell application summary
router.get(
  "/application-summary",
  protect,
  authorize("PLACEMENT"),
  getApplicationSummary
);

module.exports = router;