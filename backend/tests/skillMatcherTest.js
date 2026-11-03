const { matchSkills } = require("../services/skillMatcher");

const studentSkills = [
  "JavaScript",
  "Node.js",
  "MongoDB",
  "C++"
];

const role = {
  requiredSkills: [
    "JavaScript",
    "Node.js",
    "MongoDB",
    "Docker"
  ],
  preferredSkills: [
    "React",
    "Express.js"
  ]
};

const result = matchSkills(studentSkills, role);

console.log("Skill Match Result:");
console.log(JSON.stringify(result, null, 2));