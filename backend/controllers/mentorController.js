const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");

// ============================================================
// GET ALL STUDENTS
// ============================================================

const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({
      role: "STUDENT"
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = students.map(
      (student) => student._id
    );

    const profiles = await StudentProfile.find({
      user: { $in: studentIds }
    }).lean();

    const profileMap = new Map(
      profiles.map((profile) => [
        profile.user.toString(),
        profile
      ])
    );

    const result = students.map((student) => {
      const profile =
        profileMap.get(
          student._id.toString()
        );

      const currentSemester =
        profile?.currentSemester || 1;

      const programDuration =
        profile?.programDuration || null;

      const academicYear =
        Math.ceil(
          currentSemester / 2
        );

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,

        university:
          profile?.university || "",

        degree:
          profile?.degree || "",

        specialization:
          profile?.specialization || "",

        programDuration,

        currentSemester,

        academicYear,

        graduationYear:
          profile?.graduationYear || null,

        cgpa:
          profile?.cgpa ?? null,

        profileStatus:
          profile?.profileStatus ||
          "INCOMPLETE"
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      students: result
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET SINGLE STUDENT
// ============================================================

const getStudentById = async (
  req,
  res,
  next
) => {
  try {
    const { studentId } =
      req.params;

    const student =
      await User.findOne({
        _id: studentId,
        role: "STUDENT"
      })
        .select(
          "_id name email role createdAt"
        )
        .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const profile =
      await StudentProfile.findOne({
        user: student._id
      }).lean();


    // --------------------------------------------------------
    // STUDENT EXISTS BUT PROFILE DOES NOT EXIST
    // --------------------------------------------------------

    if (!profile) {
      return res.status(200).json({
        success: true,

        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,

          university: null,
          degree: null,
          specialization: null,

          programDuration: null,

          currentSemester: 1,

          maximumSemester: null,

          academicYear: 1,

          graduationYear: null,

          cgpa: null,

          skills: [],

          certifications: [],

          projects: [],

          experience: [],

          profileStatus: "INCOMPLETE"
        }
      });
    }


    // --------------------------------------------------------
    // PROFILE EXISTS
    // --------------------------------------------------------

    const currentSemester =
      profile.currentSemester || 1;

    const programDuration =
      profile.programDuration || null;

    const maximumSemester =
      programDuration
        ? programDuration * 2
        : null;

    const academicYear =
      Math.ceil(
        currentSemester / 2
      );


    return res.status(200).json({
      success: true,

      student: {
        id: student._id,

        name: student.name,

        email: student.email,

        role: student.role,

        university:
          profile.university || null,

        degree:
          profile.degree || null,

        specialization:
          profile.specialization || null,

        programDuration,

        currentSemester,

        maximumSemester,

        academicYear,

        graduationYear:
          profile.graduationYear || null,

        cgpa:
          profile.cgpa ?? null,

        skills:
          profile.skills || [],

        certifications:
          profile.certifications || [],

        projects:
          profile.projects || [],

        experience:
          profile.experience || [],

        profileStatus:
          profile.profileStatus ||
          "INCOMPLETE"
      }
    });

  } catch (error) {

    next(error);
  }
};


// ============================================================
// PROMOTE STUDENT
// ============================================================

const promoteStudent = async (
  req,
  res,
  next
) => {
  try {

    const { studentId } =
      req.params;


    const student =
      await User.findOne({
        _id: studentId,
        role: "STUDENT"
      });


    if (!student) {

      return res.status(404).json({
        success: false,
        message: "Student not found"
      });

    }


    const profile =
      await StudentProfile.findOne({
        user: student._id
      });


    if (!profile) {

      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });

    }


    if (!profile.programDuration) {

      return res.status(400).json({
        success: false,
        message:
          "Program duration is not configured for this student"
      });

    }


    const currentSemester =
      profile.currentSemester || 1;


    const maximumSemester =
      profile.programDuration * 2;


    if (
      currentSemester >=
      maximumSemester
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Student is already in the final semester"
      });

    }


    const previousSemester =
      currentSemester;


    const nextSemester =
      currentSemester + 1;


    profile.currentSemester =
      nextSemester;


    await profile.save();


    const academicYear =
      Math.ceil(
        nextSemester / 2
      );


    return res.status(200).json({

      success: true,

      message:
        `Student promoted from Semester ${previousSemester} to Semester ${nextSemester}`,

      student: {

        id: student._id,

        name: student.name,

        email: student.email,

        programDuration:
          profile.programDuration,

        previousSemester,

        currentSemester:
          nextSemester,

        academicYear,

        maximumSemester
      }

    });

  } catch (error) {

    next(error);
  }
};


// ============================================================
// GET STUDENT ACADEMIC PROGRESS
// ============================================================

const getStudentProgress = async (
  req,
  res,
  next
) => {
  try {

    const { studentId } =
      req.params;


    const student =
      await User.findOne({
        _id: studentId,
        role: "STUDENT"
      }).select(
        "_id name email"
      );


    if (!student) {

      return res.status(404).json({
        success: false,
        message: "Student not found"
      });

    }


    const profile =
      await StudentProfile.findOne({
        user: student._id
      });


    if (!profile) {

      return res.status(200).json({

        success: true,

        progress: {

          studentId:
            student._id,

          name:
            student.name,

          email:
            student.email,

          programDuration:
            null,

          currentSemester:
            1,

          maximumSemester:
            null,

          academicYear:
            1,

          progressPercentage:
            0,

          isFinalSemester:
            false,

          profileStatus:
            "INCOMPLETE"
        }

      });

    }


    const currentSemester =
      profile.currentSemester || 1;


    const programDuration =
      profile.programDuration || null;


    const maximumSemester =
      programDuration
        ? programDuration * 2
        : null;


    const academicYear =
      Math.ceil(
        currentSemester / 2
      );


    const progressPercentage =
      maximumSemester
        ? Math.round(
            (currentSemester /
              maximumSemester) *
              100
          )
        : 0;


    const isFinalSemester =
      maximumSemester
        ? currentSemester >=
          maximumSemester
        : false;


    return res.status(200).json({

      success: true,

      progress: {

        studentId:
          student._id,

        name:
          student.name,

        email:
          student.email,

        programDuration,

        currentSemester,

        maximumSemester,

        academicYear,

        progressPercentage,

        isFinalSemester,

        profileStatus:
          profile.profileStatus ||
          "INCOMPLETE"
      }

    });

  } catch (error) {

    next(error);
  }
};


// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {

  getAllStudents,

  getStudentById,

  promoteStudent,

  getStudentProgress

};