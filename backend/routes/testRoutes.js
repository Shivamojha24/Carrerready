const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// PROTECTED ROUTE
// ==========================================

router.get(
  "/protected",
  protect,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "You are authenticated",
      user: req.user
    });
  }
);

// ==========================================
// STUDENT-ONLY ROUTE
// ==========================================

router.get(
  "/student-only",
  protect,
  authorize("STUDENT"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Student access granted",
      user: req.user
    });
  }
);

module.exports = router;