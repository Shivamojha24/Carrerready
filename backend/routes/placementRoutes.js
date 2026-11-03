const express = require("express");


const {
  getSubmittedProfiles,
  getVerifiedProfiles,
  reviewProfile
} = require("../controllers/placementController");


const {
  protect,
  authorize
} = require("../middleware/authMiddleware");


const router =
  express.Router();


// ============================================================
// GET SUBMITTED PROFILES
// ============================================================

router.get(
  "/profiles",
  protect,
  authorize("PLACEMENT"),
  getSubmittedProfiles
);


// ============================================================
// GET VERIFIED PROFILES
// ============================================================

router.get(
  "/profiles/verified",
  protect,
  authorize("PLACEMENT"),
  getVerifiedProfiles
);


// ============================================================
// REVIEW PROFILE
// ============================================================

router.post(
  "/profiles/:profileId/review",
  protect,
  authorize("PLACEMENT"),
  reviewProfile
);


module.exports = router;