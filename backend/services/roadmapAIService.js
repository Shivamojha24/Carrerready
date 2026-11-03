const { GoogleGenAI } = require("@google/genai");


// ======================================================
// GEMINI CONFIGURATION
// ======================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


// ======================================================
// FALLBACK MODELS
// ======================================================

const GEMINI_MODELS = [
  "gemini-3.8-flash",
   "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash"
];


// ======================================================
// CLEAN AI RESPONSE
// ======================================================

const cleanAIResponse = (text) => {

  if (!text) {
    return "";
  }

  let cleaned = String(text);


  // ----------------------------------------------------
  // Remove Markdown code blocks
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /```[\s\S]*?```/g,
    ""
  );


  // ----------------------------------------------------
  // Remove Markdown headings
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /^\s*#{1,6}\s*/gm,
    ""
  );


  // ----------------------------------------------------
  // Remove bold and italic Markdown
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /\*\*/g,
    ""
  );

  cleaned = cleaned.replace(
    /\*/g,
    ""
  );


  // ----------------------------------------------------
  // Remove escaped Markdown characters
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /\\([#*_~])/g,
    "$1"
  );


  // ----------------------------------------------------
  // Remove Markdown horizontal rules
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /^\s*([-*_]){3,}\s*$/gm,
    ""
  );


  // ----------------------------------------------------
  // Remove blockquote symbol
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /^\s*>\s?/gm,
    ""
  );


  // ----------------------------------------------------
  // Convert Markdown links to normal text
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /\[([^\]]+)\]\([^)]+\)/g,
    "$1"
  );


  // ----------------------------------------------------
  // Remove backticks if AI somehow returns them
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /`/g,
    ""
  );


  // ----------------------------------------------------
  // Remove decorative characters
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /^[\s]*[•▪◦★✓→]\s*/gm,
    ""
  );


  // ----------------------------------------------------
  // Remove excessive spaces
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /[ \t]{2,}/g,
    " "
  );


  // ----------------------------------------------------
  // Normalize excessive line breaks
  // ----------------------------------------------------

  cleaned = cleaned.replace(
    /\n{3,}/g,
    "\n\n"
  );


  // ----------------------------------------------------
  // Trim every line
  // ----------------------------------------------------

  cleaned = cleaned
    .split("\n")
    .map(line => line.trim())
    .join("\n");


  return cleaned.trim();

};


// ======================================================
// GENERATE AI ROADMAP
// ======================================================

const generateRoadmapAdvice = async ({
  programDuration,
  currentSemester,
  academicYear,
  stage,
  degree,
  specialization,
  cgpa,
  skills,
  projects,
  certifications,
  targetRole,
  placementRoles,
  mentorRecommendations
}) => {


  // ====================================================
  // STUDENT SKILLS
  // ====================================================

  const studentSkills =
    Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "No skills added yet";


  // ====================================================
  // STUDENT PROJECTS
  // ====================================================

  const studentProjects =
    Array.isArray(projects) && projects.length
      ? projects
          .map(project => {

            if (
              typeof project === "string"
            ) {
              return project;
            }

            return (
              project.title ||
              "Untitled project"
            );

          })
          .join(", ")
      : "No projects added yet";


  // ====================================================
  // STUDENT CERTIFICATIONS
  // ====================================================

  const studentCertifications =
    Array.isArray(certifications) &&
    certifications.length
      ? certifications
          .map(certification => {

            if (
              typeof certification === "string"
            ) {
              return certification;
            }

            return (
              certification.name ||
              "Unnamed certification"
            );

          })
          .join(", ")
      : "No certifications added yet";


  // ====================================================
  // PLACEMENT ROLES
  // ====================================================

  const availablePlacementRoles =
    Array.isArray(placementRoles) &&
    placementRoles.length
      ? placementRoles
          .map(role => {

            const roleSkills =
              Array.isArray(
                role.requiredSkills
              )
                ? role.requiredSkills.join(", ")
                : "Not specified";

            return (
              `${role.title} - Required skills: ${roleSkills}`
            );

          })
          .join("\n")
      : "No active placement roles available";


  // ====================================================
  // MENTOR RECOMMENDATIONS
  // ====================================================

  const mentorAdvice =
    Array.isArray(
      mentorRecommendations
    ) &&
    mentorRecommendations.length
      ? mentorRecommendations
          .map(item => {

            const recommendation =
              item.recommendation ||
              "No recommendation";

            const priority =
              item.priority ||
              "MEDIUM";

            return (
              `${item.category || "CAREER"} - ${recommendation} - Priority: ${priority}`
            );

          })
          .join("\n")
      : "No mentor recommendations available";


  // ====================================================
  // AI PROMPT
  // ====================================================

  const prompt = `
You are the CareerReady AI Career Planning Assistant.

You are generating a personalized academic and career roadmap for a college student.

The response will be displayed directly inside a web application.

STUDENT PROFILE

Program Duration:
${programDuration} years

Current Semester:
${currentSemester}

Academic Year:
${academicYear}

Current Stage:
${stage}

Degree:
${degree || "Not specified"}

Specialization:
${specialization || "Not specified"}

CGPA:
${cgpa || "Not specified"}

Target Role:
${targetRole || "Not specified"}

Current Skills:
${studentSkills}

Current Projects:
${studentProjects}

Certifications:
${studentCertifications}


ACTIVE PLACEMENT ROLES

${availablePlacementRoles}


MENTOR RECOMMENDATIONS

${mentorAdvice}


ROADMAP RULES

Create advice appropriate for the student's current academic stage.

For a 4-year program:

Year 1:
Focus on programming fundamentals, web fundamentals, Git, SQL, basic DSA and beginner-level projects.

Year 2:
Focus on stronger technical skills, backend development, databases, cloud fundamentals, DSA and intermediate projects.

Year 3:
Focus strongly on DSA, aptitude, technical interviews, role-specific development skills and placement preparation.

Year 4:
Focus primarily on placement execution, interviews, applications, mock interviews, resume improvement and closing skill gaps.

For a 3-year program:

Year 1:
Focus on fundamentals and beginner projects.

Year 2:
Focus on technical skills, projects and early placement preparation.

Year 3:
Focus strongly on placement preparation and interviews.

For a 2-year program:

Year 1:
Focus on fundamentals, practical skills and projects.

Year 2:
Focus primarily on placement preparation, interviews and job applications.

Do not recommend advanced technologies simply because they are popular.

Recommendations must match the student's current academic stage.

First-year students should receive beginner-friendly projects.

Later-year students can receive intermediate or advanced projects.

Consider the student's existing skills before recommending something they already know.

Prioritize missing skills that are relevant to the target role and active placement roles.

Consider mentor recommendations as important guidance.

Do not make eligibility and readiness the same thing.

Do not invent student information.

Do not claim that a company requires a skill unless the provided placement-role information supports it.


REQUIRED RESPONSE

CURRENT STAGE

Explain the student's current academic stage and what it means for their career development.


WHAT TO LEARN NOW

Give 5 to 8 important learning priorities.

Each priority should contain:

1. Skill name
2. What the student should learn
3. Why it matters


RECOMMENDED PROJECT

Recommend one main project appropriate for the student's current stage and target role.

Include:

Project name
Technologies
Main features
Why this project is appropriate


SUPPORTING PROJECTS

Recommend 2 smaller supporting projects.

Keep them appropriate for the student's current level.


PLACEMENT SKILLS

List the most important skills the student should develop for the target role.

Prioritize skills that are missing or need improvement.


SEMESTER PLAN

Give a practical plan for the student's current semester.

Divide the plan into:

1. Learning
2. Project
3. DSA
4. Career preparation


NEXT STAGE

Explain what the student should focus on after completing the current stage.


MENTOR AND AI ADVICE

Combine the mentor recommendations with your own AI analysis.

Clearly distinguish mentor guidance from additional AI suggestions.


FINAL PRIORITY

Give 3 to 5 actions the student should prioritize immediately.


IMPORTANT OUTPUT FORMATTING RULES

Return plain text only.

The response will be displayed directly inside a web application.

Do not use Markdown.

Do not use Markdown headings.

Do not use bold formatting.

Do not use italic formatting.

Do not use hash symbols for headings.

Do not use horizontal lines.

Do not use backticks.

Do not use code blocks.

Do not use Markdown tables.

Do not use Markdown links.

Do not use bullet characters.

Do not use decorative symbols.

Do not use emojis.

Use normal section names in uppercase.

Use simple numbered lists.

Use normal paragraphs.

Leave one blank line between sections.

Keep the response professional, concise and easy to read.

Do not start with a greeting.

Do not end with unnecessary remarks.

Example structure:

CURRENT STAGE

You are currently in Year 2, Semester 4. Your main focus should be building stronger technical skills and developing practical projects.

WHAT TO LEARN NOW

1. Backend Development

Learn Express.js, REST APIs and authentication. This will help you build complete web applications.

2. Data Structures and Algorithms

Practice arrays, linked lists, stacks, queues and trees. This will improve your coding interview performance.

RECOMMENDED PROJECT

Project Name: Student Placement Management System

Technologies: HTML, CSS, JavaScript, Node.js, Express.js and MongoDB.

Why this project is appropriate: It combines your existing skills with the backend and database skills you need to strengthen.

SUPPORTING PROJECTS

1. Interactive Quiz Application

2. Student Management System

PLACEMENT SKILLS

1. Data Structures and Algorithms

2. SQL

3. Problem Solving

4. Communication

SEMESTER PLAN

1. Learning

Focus on the technical skills recommended for the current semester.

2. Project

Complete the recommended project and upload it to GitHub.

3. DSA

Practice coding problems regularly.

4. Career preparation

Improve your resume and gradually prepare for technical interviews.

NEXT STAGE

Move toward stronger development skills, larger projects and more focused placement preparation.

MENTOR AND AI ADVICE

Mentor guidance should be treated as a priority. Additional AI suggestions should complement the mentor recommendations.

FINAL PRIORITY

1. Strengthen your core technical fundamentals.

2. Complete the recommended project.

3. Practice DSA consistently.

4. Improve the skills required for your target role.
`;


  // ====================================================
  // TRY GEMINI MODELS
  // ====================================================

  let lastError = null;


  for (
    const model of GEMINI_MODELS
  ) {

    try {

      console.log(
        `Trying Gemini model: ${model}`
      );


      const response =
        await ai.models.generateContent({

          model,

          contents: prompt,

          config: {
            maxOutputTokens: 1800
          }

        });


      const rawText =
        response?.text ||
        "";


      if (!rawText.trim()) {

        throw new Error(
          "Gemini returned an empty response."
        );

      }


      const cleanedText =
        cleanAIResponse(rawText);


      console.log(
        `Gemini response received successfully from: ${model}`
      );


      return cleanedText;


    } catch (error) {

      lastError = error;


      console.error(
        `Gemini model ${model} failed`
      );

      console.error(
        error.message
      );


      const status =
        error.status ||
        error.code;


      if (
        status === 503 ||
        status === 429 ||
        status === 500
      ) {

        console.log(
          `Model ${model} unavailable. Trying fallback model...`
        );


        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              1000
            )
        );


        continue;

      }


      continue;

    }

  }


  // ====================================================
  // ALL MODELS FAILED
  // ====================================================

  console.error(
    "All Gemini models failed."
  );


  const finalError =
    new Error(
      "AI roadmap service is temporarily unavailable. Please try again."
    );


  finalError.status = 503;

  finalError.code =
    lastError?.code ||
    "AI_SERVICE_UNAVAILABLE";


  throw finalError;

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  generateRoadmapAdvice
};
