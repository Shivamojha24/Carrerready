
const Application = require("../models/Application");
const StudentProfile = require("../models/StudentProfile");
const RecruitmentDrive = require("../models/RecruitmentDrive");

// Apply for a specific recruitment role
const applyForRole = async (req, res) => {
  try {
    const { driveId, roleId } = req.params;

    const profile =
      req.studentProfile ||
      await StudentProfile.findOne({ user: req.user.id });

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

    if (drive.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "This recruitment drive is not open for applications"
      });
    }

    if (
      !drive.applicationDeadline ||
      new Date() > new Date(drive.applicationDeadline)
    ) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed or is unavailable"
      });
    }

    // Prevent duplicate applications to the same role.
    const existingApplication = await Application.findOne({
      student: profile._id,
      drive: drive._id,
      roleId: role._id
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this role"
      });
    }

    const application = await Application.create({
      student: profile._id,
      drive: drive._id,
      roleId: role._id,
      roleTitle: role.title,
      status: "REGISTERED"
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this role"
      });
    }

    console.error("Application submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message
    });
  }
};

// Get applications belonging to the logged-in student
const getMyApplications = async (req, res) => {
  try {
    const profile =
      req.studentProfile ||
      await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    const applications = await Application.find({
      student: profile._id
    })
      .populate(
        "drive",
        "companyName driveTitle applicationDeadline driveDate"
      )
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error("Get applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message
    });
  }
};

module.exports = {
  applyForRole,
  getMyApplications
};
