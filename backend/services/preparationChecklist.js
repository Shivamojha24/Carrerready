// Generate preparation tasks from missing skills and assessment gaps
const generatePreparationChecklist = ({
  missingSkills = [],
  technical = null,
  aptitude = {},
  communication = null,
  projects = null,
  mockInterview = {}
}) => {
  const checklist = [];

  // Add preparation tasks for missing technical skills
  missingSkills.forEach((skill) => {
    checklist.push({
      category: "TECHNICAL",
      priority: "HIGH",
      task: `Learn and practice ${skill}`,
      reason: `${skill} is required for the selected role`
    });
  });

  // Technical score gap
  if (technical !== null && technical < 60) {
    checklist.push({
      category: "TECHNICAL",
      priority: "HIGH",
      task: "Strengthen core technical fundamentals",
      reason: "Technical readiness score is below 60"
    });
  }

  // Aptitude preparation
  if (
    aptitude.quantitative !== undefined &&
    aptitude.quantitative < 60
  ) {
    checklist.push({
      category: "APTITUDE",
      priority: "MEDIUM",
      task: "Practice quantitative aptitude",
      reason: "Quantitative aptitude score is below 60"
    });
  }

  if (
    aptitude.logicalReasoning !== undefined &&
    aptitude.logicalReasoning < 60
  ) {
    checklist.push({
      category: "APTITUDE",
      priority: "MEDIUM",
      task: "Practice logical reasoning questions",
      reason: "Logical reasoning score is below 60"
    });
  }

  if (
    aptitude.verbal !== undefined &&
    aptitude.verbal < 60
  ) {
    checklist.push({
      category: "APTITUDE",
      priority: "MEDIUM",
      task: "Practice verbal ability",
      reason: "Verbal aptitude score is below 60"
    });
  }

  // Communication preparation
  if (communication !== null && communication < 60) {
    checklist.push({
      category: "COMMUNICATION",
      priority: "MEDIUM",
      task: "Practice communication and presentation",
      reason: "Communication score is below 60"
    });
  }

  // Project preparation
  if (projects !== null && projects < 60) {
    checklist.push({
      category: "PROJECTS",
      priority: "MEDIUM",
      task: "Improve project depth and documentation",
      reason: "Project readiness score is below 60"
    });
  }

  // Mock interview preparation
  if (
    mockInterview.technical !== undefined &&
    mockInterview.technical < 60
  ) {
    checklist.push({
      category: "MOCK_INTERVIEW",
      priority: "HIGH",
      task: "Practice technical interview questions",
      reason: "Technical mock interview score is below 60"
    });
  }

  if (
    mockInterview.hr !== undefined &&
    mockInterview.hr < 60
  ) {
    checklist.push({
      category: "MOCK_INTERVIEW",
      priority: "MEDIUM",
      task: "Practice HR interview questions",
      reason: "HR mock interview score is below 60"
    });
  }

  if (
    mockInterview.communication !== undefined &&
    mockInterview.communication < 60
  ) {
    checklist.push({
      category: "MOCK_INTERVIEW",
      priority: "MEDIUM",
      task: "Practice interview communication",
      reason: "Interview communication score is below 60"
    });
  }

  return checklist;
};

module.exports = {
  generatePreparationChecklist
};