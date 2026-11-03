const Application = require("../models/Application");

// Get all student applications for the placement cell
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .populate(
        "drive",
        "companyName driveTitle applicationDeadline driveDate"
      )
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message
    });
  }
};

// Update the status of a student application
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses = [
      "REGISTERED",
      "SHORTLISTED",
      "ASSESSMENT",
      "INTERVIEW",
      "SELECTED",
      "REJECTED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status"
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    application.status = status;

    if (notes !== undefined) {
      application.notes = notes;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message
    });
  }
};

module.exports = {
  getAllApplications,
  updateApplicationStatus
};