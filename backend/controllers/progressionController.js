const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

// ============================================================
// PROMOTE STUDENT TO NEXT SEMESTER
// ============================================================

const promoteStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Find student profile
    const studentProfile = await StudentProfile.findOne({
      user: studentId
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    // Make sure the account belongs to a student
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.role !== "STUDENT") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a student"
      });
    }

    const currentSemester = studentProfile.currentSemester || 1;
    const programDuration = studentProfile.programDuration;

    if (!programDuration) {
      return res.status(400).json({
        success: false,
        message: "Program duration is not configured for this student"
      });
    }

    // Maximum semester based on program duration
    const maximumSemester = programDuration * 2;

    // Prevent promotion beyond the final semester
    if (currentSemester >= maximumSemester) {
      return res.status(400).json({
        success: false,
        message: `Student is already in the final semester (${maximumSemester})`
      });
    }

    // Promote student
    studentProfile.currentSemester = currentSemester + 1;

    await studentProfile.save();

    // Calculate academic year
    const academicYear = Math.ceil(
      studentProfile.currentSemester / 2
    );

    return res.status(200).json({
      success: true,
      message: "Student promoted successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        programDuration: studentProfile.programDuration,
        currentSemester: studentProfile.currentSemester,
        academicYear
      }
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET STUDENT ACADEMIC PROGRESS
// ============================================================

const getStudentProgress = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const studentProfile = await StudentProfile.findOne({
      user: studentId
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    const currentSemester =
      studentProfile.currentSemester || 1;

    const programDuration =
      studentProfile.programDuration;

    const maximumSemester =
      programDuration ? programDuration * 2 : 8;

    const academicYear =
      Math.ceil(currentSemester / 2);

    return res.status(200).json({
      success: true,
      progress: {
        programDuration,
        currentSemester,
        maximumSemester,
        academicYear,
        isFinalSemester:
          currentSemester >= maximumSemester
      }
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  promoteStudent,
  getStudentProgress
};