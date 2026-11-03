const express = require("express");

const {
  analyzeMatch
} = require("../controllers/matchController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  requirePlacementAccess
} = require("../middleware/placementAccessMiddleware");

const router = express.Router();


// ============================================================
// STUDENT SKILL MATCHING
// ============================================================

router.get(
  "/:driveId/role/:roleId",
  protect,
  authorize("STUDENT"),
  requirePlacementAccess,
  analyzeMatch
);


module.exports = router;