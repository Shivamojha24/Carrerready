// Normalize skill names so equivalent values can be matched
const normalizeSkill = (skill) => {
  const aliases = {
    js: "javascript",
    javascript: "javascript",
    ts: "typescript",
    cpp: "c++",
    "c plus plus": "c++",
    node: "node.js",
    "nodejs": "node.js",
    mongo: "mongodb",
    "mongo db": "mongodb",
    html5: "html",
    css3: "css"
  };

  const normalized = skill.trim().toLowerCase();

  return aliases[normalized] || normalized;
};

// Compare student skills with a role's required and preferred skills
const matchSkills = (studentSkills = [], role) => {
  const studentSet = new Set(
    studentSkills.map(normalizeSkill).filter(Boolean)
  );

  const requiredSkills = (role.requiredSkills || []).map(normalizeSkill);
  const preferredSkills = (role.preferredSkills || []).map(normalizeSkill);

  const matchedRequired = requiredSkills.filter((skill) =>
    studentSet.has(skill)
  );

  const missingRequired = requiredSkills.filter(
    (skill) => !studentSet.has(skill)
  );

  const matchedPreferred = preferredSkills.filter((skill) =>
    studentSet.has(skill)
  );

  const missingPreferred = preferredSkills.filter(
    (skill) => !studentSet.has(skill)
  );

  const requiredMatchPercentage = requiredSkills.length
    ? Math.round((matchedRequired.length / requiredSkills.length) * 100)
    : 100;

  const preferredMatchPercentage = preferredSkills.length
    ? Math.round((matchedPreferred.length / preferredSkills.length) * 100)
    : 100;

  return {
    requiredMatchPercentage,
    preferredMatchPercentage,
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred
  };
};

module.exports = {
  normalizeSkill,
  matchSkills
};