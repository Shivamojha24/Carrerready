const getAcademicYear = (semester) => {
  return Math.ceil(Number(semester) / 2);
};

const getStage = (programDuration, academicYear) => {
  const duration = Number(programDuration);
  const year = Number(academicYear);

  if (year === 1) {
    return "FOUNDATION";
  }

  if (duration === 4 && year === 2) {
    return "SKILL_BUILDING";
  }

  if (duration === 3 && year === 2) {
    return "SKILL_BUILDING_EARLY_PLACEMENT";
  }

  if (duration === 2 && year === 2) {
    return "PLACEMENT_PREPARATION";
  }

  if (year >= 3) {
    return "PLACEMENT_PREPARATION";
  }

  return "FOUNDATION";
};


const roadmapTemplates = {
  FOUNDATION: {
    title: "Foundation & Exploration",
    description:
      "Build strong programming, web and problem-solving fundamentals before moving into advanced development.",

    learning: [
      "Programming fundamentals",
      "Object-oriented programming basics",
      "HTML and CSS",
      "JavaScript fundamentals",
      "SQL fundamentals",
      "Git and GitHub",
      "Basic data structures and algorithms",
      "Problem-solving fundamentals"
    ],

    projects: [
      "Personal Portfolio Website",
      "Quiz Application",
      "Student Management System",
      "Expense Tracker",
      "Basic To-Do Application"
    ],

    certifications: [
      "Programming fundamentals course",
      "Git and GitHub fundamentals",
      "Database fundamentals"
    ],

    placementFocus: [
      "Explore different software career paths",
      "Build coding habits",
      "Create GitHub profile",
      "Start maintaining projects"
    ]
  },

  SKILL_BUILDING: {
    title: "Technical Skill Building",
    description:
      "Develop practical development skills and start building intermediate-level projects.",

    learning: [
      "Advanced JavaScript",
      "Frontend framework fundamentals",
      "Backend development",
      "REST APIs",
      "MongoDB or SQL",
      "Advanced SQL",
      "Data structures and algorithms",
      "Object-oriented programming",
      "Cloud fundamentals",
      "Software development practices"
    ],

    projects: [
      "Event Management System",
      "Task Management Platform",
      "E-commerce Application",
      "Secure File Management System",
      "Cloud-based Student Application"
    ],

    certifications: [
      "Cloud fundamentals",
      "Database certification",
      "Web development certification"
    ],

    placementFocus: [
      "Start structured DSA practice",
      "Build 2 strong technical projects",
      "Improve GitHub profile",
      "Learn technologies relevant to target roles"
    ]
  },

  SKILL_BUILDING_EARLY_PLACEMENT: {
    title: "Advanced Skills & Early Placement Preparation",
    description:
      "Build stronger projects while gradually starting placement preparation.",

    learning: [
      "Advanced DSA",
      "Backend development",
      "REST APIs",
      "Database optimization",
      "Cloud computing",
      "System design fundamentals",
      "Testing and debugging",
      "Git and collaborative development",
      "Interview-oriented programming"
    ],

    projects: [
      "Full Stack Placement Project",
      "Cloud-based Application",
      "Role-specific Web Application",
      "Real-world API-driven Project"
    ],

    certifications: [
      "Cloud certification",
      "Backend development certification",
      "Role-specific certification"
    ],

    placementFocus: [
      "Begin aptitude preparation",
      "Practice DSA regularly",
      "Start technical interview preparation",
      "Build a placement-ready resume",
      "Track relevant placement drives"
    ]
  },

  PLACEMENT_PREPARATION: {
    title: "Placement Preparation & Career Readiness",
    description:
      "Focus on placement skills, role-specific projects and interview readiness.",

    learning: [
      "Advanced DSA",
      "Problem-solving",
      "Aptitude",
      "Logical reasoning",
      "SQL interview questions",
      "Technical interview preparation",
      "Communication skills",
      "HR interview preparation",
      "Resume optimization",
      "Mock interviews"
    ],

    projects: [
      "Role-specific placement project",
      "Industry-style full-stack project",
      "Cloud deployment project",
      "Capstone project aligned with target role"
    ],

    certifications: [
      "Role-specific professional certification",
      "Cloud certification",
      "Relevant technical assessment"
    ],

    placementFocus: [
      "Track active placement drives",
      "Close missing skill gaps",
      "Practice coding interviews",
      "Practice aptitude",
      "Prepare project explanations",
      "Complete mock interviews",
      "Prepare company-specific interview topics"
    ]
  }
};


const buildAcademicRoadmap = (profile) => {
  const semester = Number(profile.currentSemester || 1);
  const programDuration = Number(profile.programDuration || 4);

  const academicYear = getAcademicYear(semester);

  const stage = getStage(
    programDuration,
    academicYear
  );

  const template =
    roadmapTemplates[stage] ||
    roadmapTemplates.FOUNDATION;

  const maximumSemester = programDuration * 2;

  return {
    programDuration,
    currentSemester: semester,
    maximumSemester,

    academicYear,

    stage,

    stageTitle: template.title,

    description: template.description,

    learning: [...template.learning],

    projects: [...template.projects],

    certifications: [...template.certifications],

    placementFocus: [...template.placementFocus],

    isFinalYear:
      academicYear === programDuration,

    isFinalSemester:
      semester === maximumSemester
  };
};


module.exports = {
  getAcademicYear,
  getStage,
  buildAcademicRoadmap
};