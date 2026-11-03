const express = require("express");

const {
  getRecommendedRoles
} = require("../controllers/recommendedController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  requirePlacementAccess
} = require("../middleware/placementAccessMiddleware");

const router = express.Router();


// ============================================================
// STUDENT PLACEMENT RECOMMENDATIONS
// ============================================================

router.get(
  "/roles",
  protect,
  authorize("STUDENT"),
  requirePlacementAccess,
  getRecommendedRoles
);


module.exports = router;