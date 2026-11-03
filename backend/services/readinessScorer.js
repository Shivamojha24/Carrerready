// Check whether all required readiness components have valid scores
const isAssessmentComplete = ({
  technical,
  aptitude,
  communication,
  projects,
  mockInterview
}) => {
  return (
    technical !== null &&
    technical !== undefined &&
    aptitude !== null &&
    aptitude !== undefined &&
    communication !== null &&
    communication !== undefined &&
    projects !== null &&
    projects !== undefined &&
    mockInterview !== null &&
    mockInterview !== undefined
  );
};

// Calculate the final readiness score using the defined weightage
const calculateOverallScore = ({
  technical,
  aptitude,
  communication,
  projects,
  mockInterview
}) => {
  const score =
    technical * 0.40 +
    aptitude * 0.20 +
    communication * 0.15 +
    projects * 0.15 +
    mockInterview * 0.10;

  return Math.round(score * 100) / 100;
};

// Convert the numerical score into a readiness classification
const getReadinessLevel = (score) => {
  if (score === null || score === undefined) {
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

module.exports = {
  isAssessmentComplete,
  calculateOverallScore,
  getReadinessLevel
};