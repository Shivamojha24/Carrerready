
const StudentProfile = require("../models/StudentProfile");

// Get logged-in student's profile
const getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user.id
    }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};

// Create or update the student's profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      university,
      degree,
      specialization,
      programDuration,
      graduationYear,
      cgpa,
      skills,
      certifications,
      projects,
      experience
    } = req.body;

    const duration = Number(programDuration);

    if (![2, 3, 4].includes(duration)) {
      return res.status(400).json({
        success: false,
        message: "Program duration must be 2, 3 or 4 years."
      });
    }

    const existingProfile = await StudentProfile.findOne({
      user: req.user.id
    });

    // Only a mentor may promote a student.
    const currentSemester = existingProfile
      ? existingProfile.currentSemester || 1
      : 1;

    const normalizedSkills = Array.isArray(skills)
      ? skills.map(skill => String(skill).trim()).filter(Boolean)
      : [];

    const normalizedCertifications = Array.isArray(certifications)
      ? certifications
          .filter(cert => cert && typeof cert === "object")
          .filter(cert => String(cert.name || "").trim())
          .map(cert => ({
            name: String(cert.name || "").trim(),
            provider: String(cert.provider || "").trim(),
            credentialId: String(cert.credentialId || "").trim(),
            verificationUrl: String(cert.verificationUrl || "").trim(),
            issueDate: cert.issueDate || undefined,
            expiryDate: cert.expiryDate || undefined,
            status: cert.status || "PENDING"
          }))
      : [];

    const normalizedProjects = Array.isArray(projects)
      ? projects
          .filter(project => project && typeof project === "object")
          .filter(project => String(project.title || "").trim())
          .map(project => ({
            title: String(project.title || "").trim(),
            description: String(project.description || "").trim(),
            technologies: Array.isArray(project.technologies)
              ? project.technologies.map(String)
              : String(project.technologies || "")
                  .split(",")
                  .map(item => item.trim())
                  .filter(Boolean),
            projectUrl: String(project.projectUrl || "").trim(),
            githubUrl: String(project.githubUrl || "").trim()
          }))
      : [];

    const normalizedExperience = Array.isArray(experience)
      ? experience
          .map(item => {
            if (typeof item === "string") {
              return {
                type: item,
                title: "",
                organization: "",
                description: ""
              };
            }

            if (item && typeof item === "object") {
              return {
                type: String(item.type || ""),
                title: String(item.title || "").trim(),
                organization: String(item.organization || "").trim(),
                description: String(item.description || "").trim()
              };
            }

            return null;
          })
          .filter(Boolean)
      : [];

    const profileData = {
      user: req.user.id,
      university: String(university || "").trim(),
      degree: String(degree || "").trim(),
      specialization: String(specialization || "").trim(),
      programDuration: duration,
      currentSemester,
      graduationYear:
        graduationYear !== "" &&
        graduationYear !== null &&
        graduationYear !== undefined
          ? Number(graduationYear)
          : undefined,
      cgpa:
        cgpa !== "" && cgpa !== null && cgpa !== undefined
          ? Number(cgpa)
          : undefined,
      skills: normalizedSkills,
      certifications: normalizedCertifications,
      projects: normalizedProjects,
      experience: normalizedExperience,
      profileStatus: existingProfile?.profileStatus || "INCOMPLETE"
    };

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Student profile saved successfully",
      profile
    });
  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save profile",
      error: error.message
    });
  }
};

// Submit or resubmit profile for mentor verification
const submitProfile = async (req, res) => {
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

    const missingFields = [];

    if (!profile.university?.trim()) missingFields.push("University");
    if (!profile.degree?.trim()) missingFields.push("Degree");
    if (!profile.specialization?.trim()) missingFields.push("Specialization");
    if (!profile.programDuration) missingFields.push("Program duration");

    if (
      profile.graduationYear === undefined ||
      profile.graduationYear === null
    ) {
      missingFields.push("Graduation year");
    }

    if (profile.cgpa === undefined || profile.cgpa === null) {
      missingFields.push("CGPA");
    }

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message: "Complete the required fields before submitting.",
        missingFields
      });
    }

    if (profile.profileStatus === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Your profile is already awaiting mentor review."
      });
    }

    const isResubmission =
      profile.profileStatus === "CORRECTION_REQUIRED";

    profile.profileStatus = "SUBMITTED";

    profile.mentorReview = {
      status: "PENDING",
      correctionReason: "",
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: new Date()
    };

    if (!Array.isArray(profile.reviewHistory)) {
      profile.reviewHistory = [];
    }

    profile.reviewHistory.push({
      action: isResubmission ? "RESUBMITTED" : "SUBMITTED",
      reason: "",
      createdAt: new Date()
    });

    await profile.save();

    return res.status(200).json({
      success: true,
      message: isResubmission
        ? "Profile resubmitted for mentor review."
        : "Profile submitted for mentor review.",
      profileStatus: profile.profileStatus,
      mentorReview: profile.mentorReview
    });
  } catch (error) {
    console.error("SUBMIT PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit profile",
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  createOrUpdateProfile,
  submitProfile
};
