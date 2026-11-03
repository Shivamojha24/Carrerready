const StudentProfile = require("../models/StudentProfile");
const ReadinessAnalysis = require("../models/ReadinessAnalysis");
const RecruitmentDrive = require("../models/RecruitmentDrive");
const Application = require("../models/Application");

const { matchSkills } = require("../services/skillMatcher");

// ============================================================
// GET BATCH READINESS DASHBOARD
// ============================================================

const getReadinessDashboard = async (req, res) => {
  try {

    const totalStudents =
      await StudentProfile.countDocuments();


    const verifiedProfiles =
      await StudentProfile.countDocuments({
        profileStatus: "VERIFIED"
      });


    // Current readiness system
    const analyses =
      await ReadinessAnalysis.find();


    const assessedStudents =
      analyses.length;


    const readinessSummary = {
      HIGHLY_READY: 0,
      MODERATELY_READY: 0,
      NEEDS_PREPARATION: 0,
      NOT_READY: 0,
      NOT_ASSESSED: 0
    };


    const assessedScores = [];


    analyses.forEach((analysis) => {

      const score =
        analysis.overall;


      let level =
        "NOT_ASSESSED";


      if (
        score !== null &&
        score !== undefined
      ) {

        assessedScores.push(
          Number(score)
        );


        if (score >= 80) {

          level = "HIGHLY_READY";

        } else if (score >= 60) {

          level = "MODERATELY_READY";

        } else if (score >= 40) {

          level = "NEEDS_PREPARATION";

        } else {

          level = "NOT_READY";

        }

      }


      readinessSummary[level]++;

    });


    const averageReadinessScore =
      assessedScores.length
        ? Math.round(
            (
              assessedScores.reduce(
                (sum, score) =>
                  sum + score,
                0
              ) /
              assessedScores.length
            ) * 100
          ) / 100
        : null;


    res.status(200).json({

      success: true,

      dashboard: {

        totalStudents,

        verifiedProfiles,

        assessedStudents,

        unassessedStudents:
          Math.max(
            0,
            totalStudents -
              assessedStudents
          ),

        averageReadinessScore,

        readinessSummary

      }

    });

  } catch (error) {

    console.error(
      "PLACEMENT READINESS DASHBOARD ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch readiness dashboard",

      error: error.message

    });

  }
};


// ============================================================
// GET SKILL GAP SUMMARY
// ============================================================

const getSkillGapSummary = async (req, res) => {

  try {

    const profiles =
      await StudentProfile.find({
        profileStatus: "VERIFIED"
      });


    const drives =
      await RecruitmentDrive.find({
        status: {
          $in: [
            "OPEN",
            "UPCOMING"
          ]
        }
      });


    const skillGaps = {};


    profiles.forEach((profile) => {

      drives.forEach((drive) => {

        drive.roles.forEach((role) => {

          const result =
            matchSkills(
              profile.skills || [],
              role
            );


          result.missingRequired.forEach(
            (skill) => {

              const displaySkill =
                skill;


              if (
                !skillGaps[
                  displaySkill
                ]
              ) {

                skillGaps[
                  displaySkill
                ] = {

                  skill:
                    displaySkill,

                  studentCount: 0

                };

              }


              skillGaps[
                displaySkill
              ].studentCount++;

            }
          );

        });

      });

    });


    const summary =
      Object.values(skillGaps)
        .sort(
          (a, b) =>
            b.studentCount -
            a.studentCount
        );


    res.status(200).json({

      success: true,

      count:
        summary.length,

      skillGaps:
        summary

    });

  } catch (error) {

    console.error(
      "SKILL GAP ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch skill-gap summary",

      error: error.message

    });

  }

};


// ============================================================
// GET APPLICATION SUMMARY
// ============================================================

const getApplicationSummary = async (
  req,
  res
) => {

  try {

    const applications =
      await Application.find();


    const applicationSummary = {

      REGISTERED: 0,

      SHORTLISTED: 0,

      ASSESSMENT: 0,

      INTERVIEW: 0,

      SELECTED: 0,

      REJECTED: 0

    };


    applications.forEach(
      (application) => {

        if (
          applicationSummary[
            application.status
          ] !== undefined
        ) {

          applicationSummary[
            application.status
          ]++;

        }

      }
    );


    res.status(200).json({

      success: true,

      totalApplications:
        applications.length,

      applicationSummary

    });

  } catch (error) {

    console.error(
      "APPLICATION SUMMARY ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch application summary",

      error: error.message

    });

  }

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  getReadinessDashboard,

  getSkillGapSummary,

  getApplicationSummary

};