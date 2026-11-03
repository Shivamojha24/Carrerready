const StudentProfile = require("../models/StudentProfile");
const RecruitmentDrive = require("../models/RecruitmentDrive");
const { matchSkills } = require("../services/skillMatcher");

// Get recruitment roles with student-specific eligibility and skill matching
const getRecommendedRoles = async (req, res) => {
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

    const drives = await RecruitmentDrive.find({
      status: {
        $in: ["OPEN", "UPCOMING"]
      }
    }).sort({
      applicationDeadline: 1
    });

    const roles = [];

    drives.forEach((drive) => {
      drive.roles.forEach((role) => {
        const skillResult = matchSkills(profile.skills, role);

        const eligibleByCGPA =
          profile.cgpa !== undefined &&
          profile.cgpa >= (role.minimumCGPA || 0);

        const eligibleByDegree =
          !role.eligibleDegrees?.length ||
          role.eligibleDegrees.some(
            (degree) =>
              degree.toLowerCase() ===
              profile.degree?.trim().toLowerCase()
          );

        roles.push({
          driveId: drive._id,
          companyName: drive.companyName,
          driveTitle: drive.driveTitle,
          applicationDeadline: drive.applicationDeadline,
          driveDate: drive.driveDate,
          roleId: role._id,
          roleTitle: role.title,

          eligibility: {
            eligible: eligibleByCGPA && eligibleByDegree,
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

          skillMatch: skillResult
        });
      });
    });

    res.status(200).json({
      success: true,
      count: roles.length,
      roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommended roles",
      error: error.message
    });
  }
};

module.exports = {
  getRecommendedRoles
};