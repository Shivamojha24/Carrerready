const mongoose = require("mongoose");

const profileReviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    decision: {
      type: String,
      enum: ["APPROVED", "CORRECTION_REQUIRED", "REJECTED"],
      required: true
    },

    comments: {
      type: String,
      default: ""
    },

    reviewedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ProfileReview", profileReviewSchema);