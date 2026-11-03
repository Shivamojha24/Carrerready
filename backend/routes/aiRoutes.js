const express = require("express");

const {
  generateStudentPreparationAdvice
} = require("../controllers/aiController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/preparation",
  protect,
  authorize("STUDENT"),
  generateStudentPreparationAdvice
);

module.exports = router;