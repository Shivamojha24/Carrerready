const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");
const MentorRecommendation = require("../models/MentorRecommendation");
const RecruitmentDrive = require("../models/RecruitmentDrive");
const ReadinessAnalysis = require("../models/ReadinessAnalysis");

const {
    buildAcademicRoadmap
} = require("../services/academicRoadmap");

const {
    generateRoadmapAdvice
} = require("../services/roadmapAIService");


// ============================================================
// GET STUDENT ROADMAP
// GET /api/roadmap
// ============================================================

const getStudentRoadmap = async (req, res) => {

    try {

        const profile =
            await StudentProfile
                .findOne({
                    user: req.user.id
                })
                .populate(
                    "user",
                    "name email role"
                );


        if (!profile) {

            return res.status(404).json({

                success: false,

                message:
                    "Student profile not found"

            });

        }


        const roadmap =
            buildAcademicRoadmap(
                profile
            );


        // ----------------------------------------------------
        // Mentor recommendations
        // ----------------------------------------------------

        const mentorRecommendations =
            await MentorRecommendation
                .find({
                    student: req.user.id,
                    status: "ACTIVE"
                })
                .populate(
                    "mentor",
                    "name email"
                )
                .sort({
                    priority: -1,
                    createdAt: -1
                });


        // ----------------------------------------------------
        // Active placement drives
        // ----------------------------------------------------

        const placementDrives =
            await RecruitmentDrive
                .find({
                    status: {
                        $in: [
                            "OPEN",
                            "UPCOMING"
                        ]
                    }
                })
                .sort({
                    applicationDeadline: 1
                });


        // ----------------------------------------------------
        // Readiness
        // ----------------------------------------------------

        const readiness =
            await ReadinessAnalysis
                .findOne({
                    studentId: profile._id
                })
                .sort({
                    createdAt: -1
                });


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            data: {

                roadmap,

                readiness: readiness
                    ? {
                        score:
                            readiness.overallScore,

                        level:
                            readiness.readinessLevel
                    }
                    : null,

                mentorRecommendations,

                placementRoles:
                    placementDrives.map(
                        drive => ({

                            driveId:
                                drive._id,

                            companyName:
                                drive.companyName,

                            driveTitle:
                                drive.driveTitle,

                            roles:
                                drive.roles,

                            applicationDeadline:
                                drive.applicationDeadline,

                            driveDate:
                                drive.driveDate,

                            status:
                                drive.status

                        })
                    )
            }

        });


    } catch (error) {

        console.error(
            "GET STUDENT ROADMAP ERROR:"
        );

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                "Failed to load student roadmap",

            error:
                error.message

        });

    }
};



// ============================================================
// CREATE MENTOR RECOMMENDATION
// POST /api/roadmap/mentor-recommendations
// ============================================================

const createMentorRecommendation = async (
    req,
    res
) => {

    try {

        // ----------------------------------------------------
        // IMPORTANT
        //
        // We accept both:
        //
        // student
        // studentId
        //
        // and both:
        //
        // semester
        // targetSemester
        //
        // This prevents frontend/backend naming mismatch.
        // ----------------------------------------------------

        const studentId =
            req.body.student ||
            req.body.studentId;

        const semester =
            Number(
                req.body.semester ||
                req.body.targetSemester
            );

        const category =
            String(
                req.body.category || ""
            ).trim();

        const title =
            String(
                req.body.title || ""
            ).trim();

        const recommendation =
            String(
                req.body.recommendation || ""
            ).trim();

        const skills =
            Array.isArray(
                req.body.skills
            )
                ? req.body.skills
                    .map(
                        skill =>
                            String(skill).trim()
                    )
                    .filter(Boolean)
                : [];

        const suggestedProject =
            String(
                req.body.suggestedProject || ""
            ).trim();

        const priority =
            String(
                req.body.priority ||
                "MEDIUM"
            ).toUpperCase();


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !studentId ||
            !semester ||
            !category ||
            !title ||
            !recommendation
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Student, semester, category, title and recommendation are required"

            });

        }


        // ----------------------------------------------------
        // Validate ObjectId
        // ----------------------------------------------------

        const mongoose =
            require("mongoose");


        if (
            !mongoose.Types.ObjectId.isValid(
                studentId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid student ID"

            });

        }


        // ----------------------------------------------------
        // Validate semester
        // ----------------------------------------------------

        if (
            !Number.isInteger(
                semester
            ) ||
            semester < 1 ||
            semester > 8
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid semester"

            });

        }


        // ----------------------------------------------------
        // Validate category
        // ----------------------------------------------------

        const allowedCategories = [

            "LEARNING",

            "PROJECT",

            "PLACEMENT",

            "CERTIFICATION",

            "CAREER"

        ];


        if (
            !allowedCategories.includes(
                category
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid recommendation category"

            });

        }


        // ----------------------------------------------------
        // Validate priority
        // ----------------------------------------------------

        const allowedPriorities = [

            "LOW",

            "MEDIUM",

            "HIGH"

        ];


        if (
            !allowedPriorities.includes(
                priority
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid priority"

            });

        }


        // ----------------------------------------------------
        // Find student
        // ----------------------------------------------------

        const student =
            await User.findOne({

                _id:
                    studentId,

                role:
                    "STUDENT"

            });


        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    "Student not found"

            });

        }


        // ----------------------------------------------------
        // Find student profile
        // ----------------------------------------------------

        const profile =
            await StudentProfile.findOne({

                user:
                    student._id

            });


        if (!profile) {

            return res.status(404).json({

                success: false,

                message:
                    "Student profile not found"

            });

        }


        // ----------------------------------------------------
        // Maximum semester
        // ----------------------------------------------------

        const maximumSemester =
            Number(
                profile.programDuration
            ) * 2;


        if (
            semester > maximumSemester
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Semester ${semester} is beyond the student's ${profile.programDuration}-year program`

            });

        }


        // ----------------------------------------------------
        // Check mentor
        // ----------------------------------------------------

        const mentor =
            await User.findOne({

                _id:
                    req.user.id,

                role:
                    "MENTOR"

            });


        if (!mentor) {

            return res.status(403).json({

                success: false,

                message:
                    "Only mentors can create recommendations"

            });

        }


        // ----------------------------------------------------
        // Create recommendation
        // ----------------------------------------------------

        const newRecommendation =
            await MentorRecommendation.create({

                student:
                    student._id,

                mentor:
                    mentor._id,

                // IMPORTANT:
                // Database field is targetSemester.
                targetSemester:
                    semester,

                category,

                title,

                recommendation,

                skills,

                suggestedProject,

                priority,

                status:
                    "ACTIVE"

            });


        // ----------------------------------------------------
        // Populate mentor
        // ----------------------------------------------------

        await newRecommendation.populate(
            "mentor",
            "name email"
        );


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Mentor recommendation saved successfully",

            recommendation:
                newRecommendation

        });


    } catch (error) {

        console.error(
            "CREATE MENTOR RECOMMENDATION ERROR:"
        );

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                "Failed to create mentor recommendation",

            error:
                error.message

        });

    }
};



// ============================================================
// GET MENTOR RECOMMENDATIONS
// GET /api/roadmap/mentor-recommendations/:studentId
// ============================================================

const getMentorRecommendations = async (
    req,
    res
) => {

    try {

        const {
            studentId
        } = req.params;


        // ----------------------------------------------------
        // Validate student
        // ----------------------------------------------------

        const student =
            await User.findOne({

                _id:
                    studentId,

                role:
                    "STUDENT"

            });


        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    "Student not found"

            });

        }


        // ----------------------------------------------------
        // Get recommendations
        // ----------------------------------------------------

        const recommendations =
            await MentorRecommendation
                .find({

                    student:
                        student._id,

                    status:
                        "ACTIVE"

                })
                .populate(
                    "mentor",
                    "name email"
                )
                .sort({

                    targetSemester:
                        1,

                    priority:
                        -1,

                    createdAt:
                        -1

                });


        return res.status(200).json({

            success: true,

            recommendations

        });


    } catch (error) {

        console.error(
            "GET MENTOR RECOMMENDATIONS ERROR:"
        );

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                "Failed to load mentor recommendations",

            error:
                error.message

        });

    }
};



// ============================================================
// GENERATE AI ROADMAP
// POST /api/roadmap/ai
// ============================================================

const generateStudentRoadmap = async (
    req,
    res
) => {

    try {

        const profile =
            await StudentProfile
                .findOne({
                    user:
                        req.user.id
                })
                .populate(
                    "user",
                    "name email"
                );


        if (!profile) {

            return res.status(404).json({

                success: false,

                message:
                    "Student profile not found"

            });

        }


        const roadmap =
            buildAcademicRoadmap(
                profile
            );


        // ----------------------------------------------------
        // Target role
        // ----------------------------------------------------

        const targetRole =
            String(
                req.body.targetRole || ""
            ).trim();


        // ----------------------------------------------------
        // Mentor recommendations
        // ----------------------------------------------------

        const mentorRecommendations =
            await MentorRecommendation
                .find({

                    student:
                        req.user.id,

                    status:
                        "ACTIVE"

                })
                .populate(
                    "mentor",
                    "name email"
                );


        // ----------------------------------------------------
        // Placement roles
        // ----------------------------------------------------

        const placementDrives =
            await RecruitmentDrive
                .find({

                    status: {
                        $in: [
                            "OPEN",
                            "UPCOMING"
                        ]
                    }

                })
                .sort({

                    applicationDeadline:
                        1

                });


        const placementRoles =
            placementDrives.map(
                drive => ({

                    companyName:
                        drive.companyName,

                    driveTitle:
                        drive.driveTitle,

                    roles:
                        drive.roles

                })
            );


        // ----------------------------------------------------
        // Readiness
        // ----------------------------------------------------

        const readiness =
            await ReadinessAnalysis
                .findOne({

                    studentId:
                        profile._id

                })
                .sort({

                    createdAt:
                        -1

                });


        // ----------------------------------------------------
        // AI INPUT
        // ----------------------------------------------------

        const aiInput = {

            studentName:
                profile.user?.name || "",

            programDuration:
                profile.programDuration,

            currentSemester:
                profile.currentSemester,

            academicYear:
                roadmap.academicYear,

            stage:
                roadmap.stage,

            degree:
                profile.degree,

            specialization:
                profile.specialization,

            cgpa:
                profile.cgpa,

            skills:
                profile.skills || [],

            projects:
                profile.projects || [],

            certifications:
                profile.certifications || [],

            targetRole,

            readiness:
                readiness
                    ? {
                        score:
                            readiness.overallScore,

                        level:
                            readiness.readinessLevel
                    }
                    : null,

            placementRoles,

            mentorRecommendations

        };


        // ----------------------------------------------------
        // Generate AI advice
        // ----------------------------------------------------

        const advice =
            await generateRoadmapAdvice(
                aiInput
            );


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            data: {

                roadmap,

                targetRole,

                advice

            }

        });


    } catch (error) {

        console.error(
            "AI ROADMAP ERROR:",
            error
        );


        return res.status(503).json({

            success: false,

            message:
                "AI roadmap service is temporarily unavailable. Please try again."

        });

    }
};



// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    getStudentRoadmap,

    createMentorRecommendation,

    getMentorRecommendations,

    generateStudentRoadmap

};