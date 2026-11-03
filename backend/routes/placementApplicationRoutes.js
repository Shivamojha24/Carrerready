const express = require("express");

const {
  getAllApplications,
  updateApplicationStatus
} = require("../controllers/placementApplicationController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Placement Cell can view all student applications
router.get(
  "/",
  protect,
  authorize("PLACEMENT"),
  getAllApplications
);

// Placement Cell can update an application status
router.put(
  "/:applicationId/status",
  protect,
  authorize("PLACEMENT"),
  updateApplicationStatus
);

module.exports = router;