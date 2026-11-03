const RecruitmentDrive = require("../models/RecruitmentDrive");
const StudentProfile = require("../models/StudentProfile");
const { matchSkills } = require("../services/skillMatcher");

/*
=========================================================
NORMALIZE AND VALIDATE ROLES
=========================================================
*/

const normalizeRoles = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error("At least one role is required");
  }

  return roles.map((role, index) => {
    if (!role || typeof role !== "object") {
      throw new Error(`Invalid role at position ${index + 1}`);
    }

    const title = String(role.title || "").trim();

    if (!title) {
      throw new Error(`Role ${index + 1} must have a title`);
    }

    const requiredSkills = Array.isArray(role.requiredSkills)
      ? role.requiredSkills
          .map((skill) => String(skill).trim())
          .filter(Boolean)
      : [];

    const preferredSkills = Array.isArray(role.preferredSkills)
      ? role.preferredSkills
          .map((skill) => String(skill).trim())
          .filter(Boolean)
      : [];

    const eligibleDegrees = Array.isArray(role.eligibleDegrees)
      ? role.eligibleDegrees
          .map((degree) => String(degree).trim())
          .filter(Boolean)
      : [];

    let minimumCGPA = role.minimumCGPA;

    if (
      minimumCGPA !== undefined &&
      minimumCGPA !== null &&
      minimumCGPA !== ""
    ) {
      minimumCGPA = Number(minimumCGPA);

      if (
        Number.isNaN(minimumCGPA) ||
        minimumCGPA < 0 ||
        minimumCGPA > 10
      ) {
        throw new Error(
          `Invalid minimum CGPA for role "${title}". CGPA must be between 0 and 10.`
        );
      }
    } else {
      minimumCGPA = undefined;
    }

    return {
      title,
      requiredSkills,
      preferredSkills,
      eligibleDegrees,
      minimumCGPA
    };
  });
};


/*
=========================================================
CREATE DRIVE
POST /api/drives
PLACEMENT ONLY
=========================================================
*/

const createDrive = async (req, res) => {
  try {
    const {
      companyName,
      driveTitle,
      description,
      roles,
      applicationDeadline,
      driveDate,
      status
    } = req.body;

    if (
      !companyName ||
      !driveTitle ||
      !roles ||
      !applicationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, drive title, roles and application deadline are required"
      });
    }

    const cleanCompanyName = String(companyName).trim();
    const cleanDriveTitle = String(driveTitle).trim();
    const cleanDescription = String(description || "").trim();

    if (cleanCompanyName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Company name must contain at least 2 characters"
      });
    }

    if (cleanDriveTitle.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Drive title must contain at least 2 characters"
      });
    }

    const normalizedRoles = normalizeRoles(roles);

    const deadline = new Date(applicationDeadline);

    if (Number.isNaN(deadline.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid application deadline"
      });
    }

    if (deadline <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline must be in the future"
      });
    }

    let normalizedDriveDate;

    if (driveDate) {
      normalizedDriveDate = new Date(driveDate);

      if (Number.isNaN(normalizedDriveDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid drive date"
        });
      }
    }

    const allowedStatuses = [
      "UPCOMING",
      "OPEN",
      "CLOSED",
      "COMPLETED"
    ];

    const normalizedStatus = status || "UPCOMING";

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid drive status"
      });
    }

    const drive = await RecruitmentDrive.create({
      companyName: cleanCompanyName,
      driveTitle: cleanDriveTitle,
      description: cleanDescription,
      roles: normalizedRoles,
      applicationDeadline: deadline,
      driveDate: normalizedDriveDate,
      status: normalizedStatus,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Recruitment drive created successfully",
      drive
    });
  } catch (error) {
    console.error("Create drive error:", error);

    res.status(400).json({
      success: false,
      message:
        error.message || "Failed to create recruitment drive"
    });
  }
};


/*
=========================================================
GET ALL DRIVES
GET /api/drives
PLACEMENT ONLY
=========================================================
*/

const getDrives = async (req, res) => {
  try {
    const drives =
      await RecruitmentDrive.find()
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drives.length,
      drives
    });
  } catch (error) {
    console.error("Get drives error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recruitment drives"
    });
  }
};


/*
=========================================================
GET SINGLE DRIVE
GET /api/drives/:driveId
PLACEMENT ONLY
=========================================================
*/

const getDriveById = async (req, res) => {
  try {
    const drive =
      await RecruitmentDrive.findById(req.params.driveId)
        .populate("createdBy", "name email");

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Recruitment drive not found"
      });
    }

    res.status(200).json({
      success: true,
      drive
    });
  } catch (error) {
    console.error("Get drive error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid drive ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch recruitment drive"
    });
  }
};


/*
=========================================================
UPDATE DRIVE
PUT /api/drives/:driveId
PLACEMENT ONLY
=========================================================
*/

const updateDrive = async (req, res) => {
  try {
    const drive =
      await RecruitmentDrive.findById(req.params.driveId);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Recruitment drive not found"
      });
    }

    const allowedFields = [
      "companyName",
      "driveTitle",
      "description",
      "roles",
      "applicationDeadline",
      "driveDate",
      "status"
    ];

    const incomingFields = Object.keys(req.body);

    const invalidFields =
      incomingFields.filter(
        (field) => !allowedFields.includes(field)
      );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          `These fields cannot be updated: ${invalidFields.join(", ")}`
      });
    }

    if (req.body.companyName !== undefined) {
      const companyName =
        String(req.body.companyName).trim();

      if (companyName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Company name must contain at least 2 characters"
        });
      }

      drive.companyName = companyName;
    }

    if (req.body.driveTitle !== undefined) {
      const driveTitle =
        String(req.body.driveTitle).trim();

      if (driveTitle.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Drive title must contain at least 2 characters"
        });
      }

      drive.driveTitle = driveTitle;
    }

    if (req.body.description !== undefined) {
      drive.description =
        String(req.body.description).trim();
    }

    if (req.body.roles !== undefined) {
      drive.roles =
        normalizeRoles(req.body.roles);
    }

    if (req.body.applicationDeadline !== undefined) {
      const deadline =
        new Date(req.body.applicationDeadline);

      if (Number.isNaN(deadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid application deadline"
        });
      }

      drive.applicationDeadline = deadline;
    }

    if (req.body.driveDate !== undefined) {
      if (!req.body.driveDate) {
        drive.driveDate = undefined;
      } else {
        const driveDate =
          new Date(req.body.driveDate);

        if (Number.isNaN(driveDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid drive date"
          });
        }

        drive.driveDate = driveDate;
      }
    }

    if (req.body.status !== undefined) {
      const allowedStatuses = [
        "UPCOMING",
        "OPEN",
        "CLOSED",
        "COMPLETED"
      ];

      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid drive status"
        });
      }

      drive.status = req.body.status;
    }

    await drive.save();

    res.status(200).json({
      success: true,
      message: "Recruitment drive updated successfully",
      drive
    });
  } catch (error) {
    console.error("Update drive error:", error);

    res.status(400).json({
      success: false,
      message:
        error.message || "Failed to update recruitment drive"
    });
  }
};


/*
=========================================================
DELETE DRIVE
DELETE /api/drives/:driveId
PLACEMENT ONLY
=========================================================
*/

const deleteDrive = async (req, res) => {
  try {
    const drive =
      await RecruitmentDrive.findByIdAndDelete(
        req.params.driveId
      );

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Recruitment drive not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Recruitment drive deleted successfully"
    });
  } catch (error) {
    console.error("Delete drive error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid drive ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete recruitment drive"
    });
  }
};


/*
=========================================================
STUDENT — VIEW RECRUITMENT DRIVES
GET /api/drives/student
STUDENT ONLY
=========================================================
*/

const getStudentDrives = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user.id
    }).lean();

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
    })
      .sort({
        applicationDeadline: 1
      })
      .lean();

    const studentSkills = profile.skills || [];
    const studentDegree =
      (profile.degree || "").trim().toLowerCase();

    const studentCGPA = profile.cgpa;

    const studentDrives = drives.map((drive) => {
      const roles = drive.roles.map((role) => {
        const skillMatch = matchSkills(
          studentSkills,
          role
        );

        const eligibleByCGPA =
          studentCGPA !== undefined &&
          studentCGPA !== null &&
          studentCGPA >= (role.minimumCGPA || 0);

        const eligibleByDegree =
          !role.eligibleDegrees ||
          role.eligibleDegrees.length === 0 ||
          role.eligibleDegrees.some(
            (degree) =>
              degree.trim().toLowerCase() === studentDegree
          );

        const eligible =
          eligibleByCGPA && eligibleByDegree;

        return {
          roleId: role._id,
          title: role.title,

          requiredSkills:
            role.requiredSkills || [],

          preferredSkills:
            role.preferredSkills || [],

          eligibleDegrees:
            role.eligibleDegrees || [],

          minimumCGPA:
            role.minimumCGPA ?? null,

          eligible,

          skillMatch:
            skillMatch.requiredMatchPercentage,

          preferredSkillMatch:
            skillMatch.preferredMatchPercentage,

          matchedSkills:
            skillMatch.matchedRequired,

          missingSkills:
            skillMatch.missingRequired
        };
      });

      return {
        driveId: drive._id,
        companyName: drive.companyName,
        driveTitle: drive.driveTitle,
        description: drive.description || "",
        applicationDeadline:
          drive.applicationDeadline,
        driveDate:
          drive.driveDate || null,
        status: drive.status,
        roles
      };
    });

    return res.status(200).json({
      success: true,
      count: studentDrives.length,
      drives: studentDrives
    });
  } catch (error) {
    console.error(
      "Get student drives error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student placement drives"
    });
  }
};


/*
=========================================================
EXPORT CONTROLLERS
=========================================================
*/

module.exports = {
  createDrive,
  getDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  getStudentDrives
};