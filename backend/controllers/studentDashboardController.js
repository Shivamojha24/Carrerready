
const StudentProfile = require("../models/StudentProfile");
const ReadinessAssessment = require("../models/ReadinessAssessment");
const Application = require("../models/Application");
const RecruitmentDrive = require("../models/RecruitmentDrive");

const { matchSkills } = require("../services/skillMatcher");
const {
  generatePreparationChecklist
} = require("../services/preparationChecklist");

const {
  buildAcademicRoadmap
} = require("../services/academicRoadmap");

// ------------------------------------------------------------
// Helper: Application status summary
// ------------------------------------------------------------
const createApplicationSummary = (applications = []) => {
  const summary = {
    REGISTERED: 0,
    SHORTLISTED: 0,
    ASSESSMENT: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0
  };

  applications.forEach((application) => {
    if (Object.prototype.hasOwnProperty.call(summary, application.status)) {
      summary[application.status]++;
    }
  });

  return summary;
};

// ------------------------------------------------------------
// GET STUDENT DASHBOARD
// ------------------------------------------------------------
const getStudentDashboard = async (req, res) => {
  try {
    // 1. Find the logged-in student's profile
    const profile = await StudentProfile.findOne({
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    // 2. Calculate the academic roadmap
    const roadmap = buildAcademicRoadmap(profile);

    const programDuration = Number(profile.programDuration);
    const currentSemester = Number(profile.currentSemester || 1);
    const academicYear = Math.ceil(currentSemester / 2);
    const maximumSemester = programDuration * 2;

    // Placement access starts in the pre-final year.
    // 4-year program: Year 3, Semester 5
    // 3-year program: Year 2, Semester 3
    // 2-year program: Year 1, Semester 1
    const preFinalYear = Math.max(1, programDuration - 1);

    const placementAccess = academicYear >= preFinalYear;

    const academic = {
      ...roadmap,
      programDuration,
      currentSemester,
      academicYear,
      maximumSemester,
      preFinalYear,
      isFinalYear: academicYear === programDuration,
      isFinalSemester: currentSemester === maximumSemester,
      placementAccess
    };

    const placementMessage = placementAccess
      ? "Placement opportunities are available for your academic stage."
      : `Placement opportunities unlock in Year ${preFinalYear}. You are currently in Year ${academicYear}, Semester ${currentSemester}.`;

    // 3. Load readiness assessment
    const assessment = await ReadinessAssessment.findOne({
      student: profile._id
    });

    const readiness = assessment
      ? {
          overallScore: assessment.overallScore,
          readinessLevel: assessment.readinessLevel
        }
      : {
          overallScore: null,
          readinessLevel: "NOT_ASSESSED"
        };

    // 4. Initialize placement data.
    // These remain empty for students who have not unlocked placement.
    let applications = [];
    let recommendedRoles = [];
    let preparationChecklist = [];

    const applicationSummary = createApplicationSummary();

    // 5. Load placement data only when the student is eligible
    if (placementAccess) {
      applications = await Application.find({
        student: profile._id
      })
        .populate(
          "drive",
          "companyName driveTitle applicationDeadline driveDate"
        )
        .sort({ appliedAt: -1 });

      Object.assign(
        applicationSummary,
        createApplicationSummary(applications)
      );

      const drives = await RecruitmentDrive.find({
        status: { $in: ["OPEN", "UPCOMING"] }
      }).sort({ applicationDeadline: 1 });

      const degree = String(profile.degree || "")
        .trim()
        .toLowerCase();

      // 6. Match student skills against available roles
      drives.forEach((drive) => {
        const roles = Array.isArray(drive.roles) ? drive.roles : [];

        roles.forEach((role) => {
          const skillMatch = matchSkills(
            profile.skills || [],
            role
          );

          const minimumCGPA = Number(role.minimumCGPA || 0);

          const eligibleByCGPA =
            profile.cgpa !== undefined &&
            profile.cgpa !== null &&
            Number(profile.cgpa) >= minimumCGPA;

          const eligibleDegrees = Array.isArray(role.eligibleDegrees)
            ? role.eligibleDegrees
            : [];

          const eligibleByDegree =
            eligibleDegrees.length === 0 ||
            eligibleDegrees.some(
              (eligibleDegree) =>
                String(eligibleDegree).trim().toLowerCase() === degree
            );

          recommendedRoles.push({
            driveId: drive._id,
            companyName: drive.companyName,
            driveTitle: drive.driveTitle,
            applicationDeadline: drive.applicationDeadline,
            driveDate: drive.driveDate,
            roleId: role._id,
            roleTitle: role.title,
            eligible: eligibleByCGPA && eligibleByDegree,
            skillMatch: skillMatch.requiredMatchPercentage,
            missingSkills: skillMatch.missingRequired
          });
        });
      });

      // Show the highest skill matches first.
      recommendedRoles.sort(
        (a, b) => b.skillMatch - a.skillMatch
      );

      // 7. Generate preparation tasks from skill gaps and assessment scores
      const allMissingSkills = [
        ...new Set(
          recommendedRoles.flatMap(
            (role) => role.missingSkills || []
          )
        )
      ];

      preparationChecklist = generatePreparationChecklist({
        missingSkills: allMissingSkills,
        technical: assessment?.technical?.score ?? null,
        aptitude: assessment?.aptitude || {},
        communication: assessment?.communication?.score ?? null,
        projects: assessment?.projects?.score ?? null,
        mockInterview: assessment?.mockInterview || {}
      });
    }

    // 8. Return one consistent dashboard response
    return res.status(200).json({
      success: true,

      dashboard: {
        profile: {
          name: req.user.name,
          email: req.user.email,
          profileStatus: profile.profileStatus,
          university: profile.university,
          degree: profile.degree,
          specialization: profile.specialization,
          programDuration,
          currentSemester,
          academicYear,
          maximumSemester,
          graduationYear: profile.graduationYear,
          cgpa: profile.cgpa,
          skills: profile.skills || []
        },

        academic,

        roadmap,

        readiness,

        placement: {
          access: placementAccess,
          message: placementMessage
        },

        applications: {
          total: applications.length,
          summary: applicationSummary,
          recent: applications.slice(0, 5)
        },

        recommendedRoles: recommendedRoles.slice(0, 10),

        preparationChecklist,

        nextFocus: roadmap.learning || []
      }
    });
  } catch (error) {
    console.error("Student dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student dashboard",
      error: error.message
    });
  }
};

module.exports = {
  getStudentDashboard
};
