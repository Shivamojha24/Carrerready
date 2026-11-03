const mongoose = require("mongoose");

const mentorRecommendationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    targetSemester: {
      type: Number,
      min: 1,
      max: 8,
      required: true
    },

    category: {
      type: String,
      enum: [
        "LEARNING",
        "PROJECT",
        "PLACEMENT",
        "CERTIFICATION",
        "CAREER"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    recommendation: {
      type: String,
      required: true,
      trim: true
    },

    skills: [
      {
        type: String,
        trim: true
      }
    ],

    suggestedProject: {
      type: String,
      default: "",
      trim: true
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM"
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "MentorRecommendation",
  mentorRecommendationSchema
);