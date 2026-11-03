const mongoose = require("mongoose");

const readinessAssessmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      unique: true
    },

    technical: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      assessed: {
        type: Boolean,
        default: false
      }
    },

    aptitude: {
      quantitative: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      logicalReasoning: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      verbal: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      assessed: {
        type: Boolean,
        default: false
      }
    },

    communication: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      assessed: {
        type: Boolean,
        default: false
      }
    },

    projects: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      assessed: {
        type: Boolean,
        default: false
      }
    },

    mockInterview: {
      technical: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      hr: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      communication: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      assessed: {
        type: Boolean,
        default: false
      }
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },

    readinessLevel: {
      type: String,
      enum: [
        "HIGHLY_READY",
        "MODERATELY_READY",
        "NEEDS_PREPARATION",
        "NOT_READY",
        "NOT_ASSESSED"
      ],
      default: "NOT_ASSESSED"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ReadinessAssessment",
  readinessAssessmentSchema
);