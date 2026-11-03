const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC USER INFORMATION
    // ============================================================
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    // ============================================================
    // USER ROLE
    // ============================================================
    role: {
      type: String,
      enum: [
        "STUDENT",
        "MENTOR",
        "PLACEMENT"
      ],
      default: "STUDENT"
    },

    // ============================================================
    // PROFILE STATUS
    // ============================================================
    profileStatus: {
      type: String,
      enum: [
        "INCOMPLETE",
        "SUBMITTED",
        "VERIFIED",
        "CORRECTION_REQUIRED"
      ],
      default: "INCOMPLETE"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);