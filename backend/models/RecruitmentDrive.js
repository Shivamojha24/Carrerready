const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    requiredSkills: [
      {
        type: String,
        trim: true
      }
    ],

    preferredSkills: [
      {
        type: String,
        trim: true
      }
    ],

    minimumCGPA: {
      type: Number,
      min: 0,
      max: 10
    },

    eligibleDegrees: [
      {
        type: String,
        trim: true
      }
    ]
  },
  { _id: true }
);

const recruitmentDriveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },

    driveTitle: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    roles: {
      type: [roleSchema],
      required: true,
      validate: {
        validator: (roles) => roles.length > 0,
        message: "At least one role is required"
      }
    },

    applicationDeadline: {
      type: Date,
      required: true
    },

    driveDate: {
      type: Date
    },

    status: {
      type: String,
      enum: ["UPCOMING", "OPEN", "CLOSED", "COMPLETED"],
      default: "UPCOMING"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "RecruitmentDrive",
  recruitmentDriveSchema
);