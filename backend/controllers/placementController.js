const StudentProfile = require("../models/StudentProfile");
const ProfileReview = require("../models/ProfileReview");


// ============================================================
// GET SUBMITTED PROFILES
// ============================================================

const getSubmittedProfiles = async (req, res) => {

  try {

    const profiles =
      await StudentProfile.find({
        profileStatus: "SUBMITTED"
      })
      .populate(
        "user",
        "name email"
      )
      .sort({
        updatedAt: -1
      });


    res.status(200).json({

      success: true,

      count: profiles.length,

      profiles

    });

  } catch (error) {

    console.error(
      "Get submitted profiles error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch submitted profiles",

      error:
        error.message

    });

  }

};


// ============================================================
// GET VERIFIED PROFILES
// ============================================================

const getVerifiedProfiles = async (req, res) => {

  try {

    const profiles =
      await StudentProfile.find({
        profileStatus: "VERIFIED"
      })
      .populate(
        "user",
        "name email"
      )
      .sort({
        updatedAt: -1
      });


    res.status(200).json({

      success: true,

      count: profiles.length,

      profiles

    });

  } catch (error) {

    console.error(
      "Get verified profiles error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch verified profiles",

      error:
        error.message

    });

  }

};


// ============================================================
// REVIEW STUDENT PROFILE
// ============================================================

const reviewProfile = async (req, res) => {

  try {

    const {
      profileId
    } = req.params;


    const {
      decision,
      comments
    } = req.body;


    // --------------------------------------------------------
    // Validate decision
    // --------------------------------------------------------

    const validDecisions = [
      "APPROVED",
      "CORRECTION_REQUIRED",
      "REJECTED"
    ];


    if (
      !validDecisions.includes(
        decision
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid review decision"

      });

    }


    // --------------------------------------------------------
    // Find profile
    // --------------------------------------------------------

    const profile =
      await StudentProfile.findById(
        profileId
      );


    if (!profile) {

      return res.status(404).json({

        success: false,

        message:
          "Student profile not found"

      });

    }


    // --------------------------------------------------------
    // Check profile status
    // --------------------------------------------------------

    if (
      profile.profileStatus !==
      "SUBMITTED"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Profile is not awaiting review"

      });

    }


    // --------------------------------------------------------
    // Map decision to profile status
    // --------------------------------------------------------

    const statusMap = {

      APPROVED:
        "VERIFIED",

      CORRECTION_REQUIRED:
        "CORRECTION_REQUIRED",

      REJECTED:
        "CORRECTION_REQUIRED"

    };


    profile.profileStatus =
      statusMap[decision];


    await profile.save();


    // --------------------------------------------------------
    // Create review record
    // --------------------------------------------------------

    const review =
      await ProfileReview.create({

        student:
          profile._id,

        reviewedBy:
          req.user.id,

        decision:
          decision,

        comments:
          comments || ""

      });


    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.status(200).json({

      success: true,

      message:
        "Profile review completed",

      profileStatus:
        profile.profileStatus,

      review

    });

  } catch (error) {

    console.error(
      "Review profile error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to review profile",

      error:
        error.message

    });

  }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

  getSubmittedProfiles,

  getVerifiedProfiles,

  reviewProfile

};