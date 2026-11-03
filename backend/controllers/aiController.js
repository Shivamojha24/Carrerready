const StudentProfile = require("../models/StudentProfile");
const RecruitmentDrive = require("../models/RecruitmentDrive");
const ReadinessAnalysis = require("../models/ReadinessAnalysis");

const { matchSkills } = require("../services/skillMatcher");
const {
  generatePreparationAdvice
} = require("../services/openaiService");

const getReadinessLevel = (score) => {
  if (score === null || score === undefined) {
    return "Not assessed";
  }

  if (score >= 80) return "Highly Ready";
  if (score >= 60) return "Moderately Ready";
  if (score >= 40) return "Needs Preparation";

  return "Not Ready";
};

const generateStudentPreparationAdvice = async (req, res) => {
  try {
    const { driveId, roleId } = req.body;

    if (!driveId || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Drive ID and role ID are required"
      });
    }

    // Get student profile
    const profile = await StudentProfile.findOne({
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    // Get selected recruitment drive
    const drive = await RecruitmentDrive.findById(driveId);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Recruitment drive not found"
      });
    }

    // Get selected role
    const role = drive.roles.id(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found in this recruitment drive"
      });
    }

    // Calculate actual skill match
    const skillResult = matchSkills(
      profile.skills || [],
      role
    );

    // Get latest readiness assessment
    const assessment = await ReadinessAnalysis.findOne({
      studentId: req.user.id
    }).sort({
      calculatedAt: -1
    });

    const readinessScore = assessment?.overall ?? null;

    const readinessLevel =
      getReadinessLevel(readinessScore);

    // Generate AI preparation advice
    const advice = await generatePreparationAdvice({
      studentSkills: profile.skills || [],

      missingSkills:
        skillResult.missingRequired || [],

      roleTitle: role.title,

      companyName: drive.companyName,

      readinessScore,

      readinessLevel
    });

    return res.status(200).json({
      success: true,

      message:
        "AI preparation advice generated successfully",

      data: {
        drive: {
          id: drive._id,
          companyName: drive.companyName,
          driveTitle: drive.driveTitle
        },

        role: {
          id: role._id,
          title: role.title
        },

        readiness: {
          score: readinessScore,
          level: readinessLevel
        },

        skillMatch: skillResult,

        advice
      }
    });

  } catch (error) {
    console.error("====================================");
    console.error("AI PREPARATION ERROR");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Status:", error.status);
    console.error("====================================");

    return res.status(error.status || 500).json({
      success: false,
      message:
        "Failed to generate AI preparation advice",
      error: error.message,
      code: error.code || null
    });
  }
};

module.exports = {
  generateStudentPreparationAdvice
};