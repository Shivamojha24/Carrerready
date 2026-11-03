
const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    // ============================================================
    // USER
    // ============================================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // ============================================================
    // BASIC ACADEMIC INFORMATION
    // ============================================================
    university: {
      type: String,
      default: "",
      trim: true
    },

    degree: {
      type: String,
      default: "",
      trim: true
    },

    specialization: {
      type: String,
      default: "",
      trim: true
    },

    // ============================================================
    // ACADEMIC PROGRESSION
    // ============================================================
    programDuration: {
      type: Number,
      enum: [2, 3, 4],
      required: true
    },

    // Mentor-controlled; students cannot update this field
    currentSemester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
      required: true
    },

    graduationYear: {
      type: Number
    },

    cgpa: {
      type: Number,
      min: 0,
      max: 10
    },

    // ============================================================
    // SKILLS
    // ============================================================
    skills: [
      {
        type: String,
        trim: true
      }
    ],

    // ============================================================
    // CERTIFICATIONS
    // ============================================================
    certifications: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },

        provider: {
          type: String,
          default: ""
        },

        credentialId: {
          type: String,
          default: ""
        },

        verificationUrl: {
          type: String,
          default: ""
        },

        issueDate: {
          type: Date
        },

        expiryDate: {
          type: Date
        },

        status: {
          type: String,
          enum: [
            "PENDING",
            "VERIFIED",
            "REJECTED",
            "EXPIRED"
          ],
          default: "PENDING"
        }
      }
    ],

    // ============================================================
    // PROJECTS
    // ============================================================
    projects: [
      {
        title: {
          type: String,
          required: true,
          trim: true
        },

        description: {
          type: String,
          default: ""
        },

        technologies: [
          {
            type: String,
            trim: true
          }
        ],

        projectUrl: {
          type: String,
          default: ""
        },

        githubUrl: {
          type: String,
          default: ""
        }
      }
    ],

    // ============================================================
    // EXPERIENCE
    // ============================================================
    experience: [
      {
        type: {
          type: String,
          enum: [
            "INTERNSHIP",
            "ACADEMIC_PROJECT",
            "PERSONAL_PROJECT",
            "HACKATHON",
            "OPEN_SOURCE",
            "FREELANCE",
            "RESEARCH",
            "PROFESSIONAL_EXPERIENCE"
          ]
        },

        title: {
          type: String,
          default: ""
        },

        organization: {
          type: String,
          default: ""
        },

        description: {
          type: String,
          default: ""
        }
      }
    ],

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
    },

    // ============================================================
    // MENTOR REVIEW
    // ============================================================
    mentorReview: {
      status: {
        type: String,
        enum: [
          "PENDING",
          "VERIFIED",
          "CORRECTION_REQUIRED"
        ],
        default: "PENDING"
      },

      correctionReason: {
        type: String,
        default: "",
        trim: true
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },

      reviewedAt: {
        type: Date,
        default: null
      },

      submittedAt: {
        type: Date,
        default: null
      }
    },

    // ============================================================
    // MENTOR REVIEW HISTORY
    // ============================================================
    reviewHistory: [
      {
        action: {
          type: String,
          enum: [
            "SUBMITTED",
            "VERIFIED",
            "CORRECTION_REQUESTED",
            "RESUBMITTED"
          ],
          required: true
        },

        reason: {
          type: String,
          default: "",
          trim: true
        },

        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);
