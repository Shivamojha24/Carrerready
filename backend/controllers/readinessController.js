const ReadinessAnalysis = require("../models/ReadinessAnalysis");
const StudentProfile = require("../models/StudentProfile");
const RecruitmentDrive = require("../models/RecruitmentDrive");

const { matchSkills } = require("../services/skillMatcher");


/* =========================================================
   READINESS LEVEL
========================================================= */

const getReadinessLevel = (score) => {

    if (
        score === null ||
        score === undefined
    ) {
        return "NOT_ASSESSED";
    }

    if (score >= 80) {
        return "HIGHLY_READY";
    }

    if (score >= 60) {
        return "MODERATELY_READY";
    }

    if (score >= 40) {
        return "NEEDS_PREPARATION";
    }

    return "NOT_READY";
};


/* =========================================================
   SAVE ASSESSMENT
========================================================= */

const saveAssessment = async (req, res) => {

    try {

        const profile =
            await StudentProfile.findOne({
                user: req.user.id
            });


        if (!profile) {

            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });

        }


        const {
            technical,
            aptitude,
            communication,
            projects,
            mockInterview
        } = req.body;


        /* -------------------------------------------------
           VALIDATE SCORES
        ------------------------------------------------- */

        const scores = [
            technical,
            aptitude,
            communication,
            projects,
            mockInterview
        ];


        const invalidScore =
            scores.some(
                score =>
                    typeof score !== "number" ||
                    score < 0 ||
                    score > 100
            );


        if (invalidScore) {

            return res.status(400).json({
                success: false,
                message:
                    "All assessment scores must be numbers between 0 and 100"
            });

        }


        /* -------------------------------------------------
           CALCULATE OVERALL READINESS
        ------------------------------------------------- */

        const overall =
            (
                technical * 0.40 +
                aptitude * 0.20 +
                communication * 0.15 +
                projects * 0.15 +
                mockInterview * 0.10
            );


        const roundedOverall =
            Math.round(
                overall * 100
            ) / 100;


        const readinessLevel =
            getReadinessLevel(
                roundedOverall
            );


        /* -------------------------------------------------
           GET ACTIVE PLACEMENT ROLES
        ------------------------------------------------- */

        const drives =
            await RecruitmentDrive.find({
                status: {
                    $in: [
                        "OPEN",
                        "UPCOMING"
                    ]
                }
            });


        /* -------------------------------------------------
           CALCULATE REAL SKILL MATCH
        ------------------------------------------------- */

        const skillMatches = [];

        const allMissingSkills = [];


        drives.forEach(
            (drive) => {

                drive.roles.forEach(
                    (role) => {

                        const result =
                            matchSkills(
                                profile.skills || [],
                                role
                            );


                        skillMatches.push(
                            result.requiredMatchPercentage
                        );


                        if (
                            Array.isArray(
                                result.missingRequired
                            )
                        ) {

                            allMissingSkills.push(
                                ...result.missingRequired
                            );

                        }

                    }
                );

            }
        );


        let skillMatch = 0;


        if (
            skillMatches.length > 0
        ) {

            const totalSkillMatch =
                skillMatches.reduce(
                    (
                        total,
                        value
                    ) =>
                        total + value,
                    0
                );


            skillMatch =
                Math.round(
                    (
                        totalSkillMatch /
                        skillMatches.length
                    ) * 100
                ) / 100;

        }


        /* -------------------------------------------------
           REMOVE DUPLICATE SKILL GAPS
        ------------------------------------------------- */

        const gaps =
            [
                ...new Set(
                    allMissingSkills.map(
                        skill =>
                            String(skill).trim()
                    )
                )
            ].filter(Boolean);


        /* -------------------------------------------------
           SAVE BREAKDOWN
        ------------------------------------------------- */

        const breakdown = {

            aptitude: {

                quantitative:
                    aptitude,

                logicalReasoning:
                    aptitude,

                verbal:
                    aptitude

            },

            mockInterview: {

                technical:
                    mockInterview,

                hr:
                    mockInterview,

                communication:
                    mockInterview

            },

            weightage: {

                technical: "40%",

                aptitude: "20%",

                communication: "15%",

                projects: "15%",

                mockInterview: "10%"

            }

        };


        /* -------------------------------------------------
           SAVE TO DATABASE
        ------------------------------------------------- */

        const assessment =
            await ReadinessAnalysis.findOneAndUpdate(

                {
                    studentId:
                        req.user.id
                },

                {

                    studentId:
                        req.user.id,

                    technical,

                    aptitude,

                    communication,

                    projects,

                    mockInterview,

                    overall:
                        roundedOverall,

                    skillMatch,

                    gaps,

                    breakdown,

                    calculatedAt:
                        new Date()

                },

                {

                    new: true,

                    upsert: true,

                    runValidators: true

                }

            );


        /* -------------------------------------------------
           RESPONSE
        ------------------------------------------------- */

        return res.status(200).json({

            success: true,

            message:
                "Readiness assessment saved successfully",

            assessment

        });

    } catch (error) {

        console.error(
            "SAVE READINESS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to save readiness assessment",

            error:
                error.message

        });

    }

};


/* =========================================================
   GET ASSESSMENT
========================================================= */

const getAssessment = async (req, res) => {

    try {

        const assessment =
            await ReadinessAnalysis.findOne({

                studentId:
                    req.user.id

            }).sort({
                calculatedAt: -1
            });


        if (!assessment) {

            return res.status(404).json({

                success: false,

                message:
                    "Readiness assessment not found"

            });

        }


        return res.status(200).json({

            success: true,

            assessment

        });

    } catch (error) {

        console.error(
            "GET READINESS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch readiness assessment",

            error:
                error.message

        });

    }

};


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {

    saveAssessment,

    getAssessment

};