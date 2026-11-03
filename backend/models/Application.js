const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true
    },

    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruitmentDrive",
      required: true
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    roleTitle: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "REGISTERED",
        "SHORTLISTED",
        "ASSESSMENT",
        "INTERVIEW",
        "SELECTED",
        "REJECTED"
      ],
      default: "REGISTERED"
    },

    appliedAt: {
      type: Date,
      default: Date.now
    },

    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate applications for the same student and role
applicationSchema.index(
  {
    student: 1,
    drive: 1,
    roleId: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model("Application", applicationSchema);