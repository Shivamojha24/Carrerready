const StudentProfile = require("../models/StudentProfile");
const RecruitmentDrive = require("../models/RecruitmentDrive");
const { matchSkills } = require("../services/skillMatcher");
const {
  generatePreparationChecklist
} = require("../services/preparationChecklist");

// Analyze how well a student matches a selected role
const analyzeMatch = async (req, res) => {
  try {
    const { driveId, roleId } = req.params;

    const profile = await StudentProfile.findOne({
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    const drive = await RecruitmentDrive.findById(driveId);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Recruitment drive not found"
      });
    }

    const role = drive.roles.id(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found in this recruitment drive"
      });
    }

    const skillResult = matchSkills(profile.skills, role);

    const eligibleByCGPA =
      profile.cgpa !== undefined &&
      profile.cgpa >= (role.minimumCGPA || 0);

    const eligibleByDegree =
      !role.eligibleDegrees?.length ||
      role.eligibleDegrees.some(
        (degree) =>
          degree.toLowerCase() === profile.degree?.trim().toLowerCase()
      );

    const eligible = eligibleByCGPA && eligibleByDegree;

    const preparationChecklist = generatePreparationChecklist({
      missingSkills: skillResult.missingRequired,
      technical: null,
      aptitude: {},
      communication: null,
      projects: null,
      mockInterview: {}
    });

    res.status(200).json({
      success: true,

      drive: {
        id: drive._id,
        companyName: drive.companyName,
        driveTitle: drive.driveTitle
      },

      role: {
        id: role._id,
        title: role.title
      },

      eligibility: {
        eligible,

        cgpa: {
          required: role.minimumCGPA || 0,
          student: profile.cgpa ?? null,
          eligible: eligibleByCGPA
        },

        degree: {
          required: role.eligibleDegrees || [],
          student: profile.degree || "",
          eligible: eligibleByDegree
        }
      },

      skillMatch: skillResult,

      preparationChecklist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to analyze skill match",
      error: error.message
    });
  }
};

module.exports = {
  analyzeMatch
};