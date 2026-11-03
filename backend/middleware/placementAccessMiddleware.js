
const StudentProfile = require("../models/StudentProfile");

const requirePlacementAccess = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    const programDuration = Number(profile.programDuration);
    const currentSemester = Number(profile.currentSemester);

    if (
      ![2, 3, 4].includes(programDuration) ||
      !Number.isInteger(currentSemester) ||
      currentSemester < 1 ||
      currentSemester > programDuration * 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid academic progression is required."
      });
    }

    const academicYear = Math.ceil(currentSemester / 2);
    const preFinalYear = Math.max(1, programDuration - 1);
    const placementAccess = academicYear >= preFinalYear;

    if (!placementAccess) {
      return res.status(403).json({
        success: false,
        code: "PLACEMENT_ACCESS_NOT_AVAILABLE",
        message:
          `Placement access unlocks in Year ${preFinalYear}. ` +
          `You are currently in Year ${academicYear}, ` +
          `Semester ${currentSemester}.`,
        academic: {
          programDuration,
          currentSemester,
          academicYear,
          preFinalYear,
          placementAccess: false
        }
      });
    }

    // Make the verified profile available to downstream handlers.
    req.studentProfile = profile;
    req.placementAcademic = {
      programDuration,
      currentSemester,
      academicYear,
      preFinalYear,
      placementAccess: true
    };

    return next();
  } catch (error) {
    console.error("Placement access check failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify placement access."
    });
  }
};

module.exports = {
  requirePlacementAccess
};
