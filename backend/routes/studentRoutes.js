
const express = require("express");

const {
  getProfile,
  createOrUpdateProfile,
  submitProfile
} = require("../controllers/studentController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Fail clearly at startup if an imported handler is missing.
[
  ["protect", protect],
  ["authorize", authorize],
  ["getProfile", getProfile],
  ["createOrUpdateProfile", createOrUpdateProfile],
  ["submitProfile", submitProfile]
].forEach(([name, handler]) => {
  if (typeof handler !== "function") {
    throw new TypeError(
      `studentRoutes.js: "${name}" is not a function. Check its export/import.`
    );
  }
});

router.get(
  "/profile",
  protect,
  authorize("STUDENT"),
  getProfile
);

router.post(
  "/profile",
  protect,
  authorize("STUDENT"),
  createOrUpdateProfile
);

router.post(
  "/profile/submit",
  protect,
  authorize("STUDENT"),
  submitProfile
);

module.exports = router;
