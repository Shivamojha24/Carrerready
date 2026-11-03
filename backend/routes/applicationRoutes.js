
const express = require("express");

const {
  applyForRole,
  getMyApplications
} = require("../controllers/applicationController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  requirePlacementAccess
} = require("../middleware/placementAccessMiddleware");

const router = express.Router();

// Apply for a role.
// Placement access is checked on the backend.
router.post(
  "/:driveId/role/:roleId",
  protect,
  authorize("STUDENT"),
  requirePlacementAccess,
  applyForRole
);

// View the logged-in student's applications.
router.get(
  "/my",
  protect,
  authorize("STUDENT"),
  requirePlacementAccess,
  getMyApplications
);

module.exports = router;
