const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is missing. Check backend/.env"
  );
}

// =====================================================
// Gemini models
// =====================================================

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash"
];

// =====================================================
// Sleep helper
// =====================================================

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// =====================================================
// Generate AI Preparation Advice
// =====================================================

const generatePreparationAdvice = async ({
  studentSkills = [],
  missingSkills = [],
  roleTitle = "",
  companyName = "",
  readinessScore = null,
  readinessLevel = "Not assessed"
}) => {

  const prompt = `
You are the CareerReady AI Preparation Assistant.

Your job is to provide practical and realistic placement preparation advice for a college student.

STUDENT INFORMATION

Current Skills:
${studentSkills.length
    ? studentSkills.join(", ")
    : "No skills listed"}

Missing Required Skills:
${missingSkills.length
    ? missingSkills.join(", ")
    : "No missing required skills"}

Target Role:
${roleTitle}

Company:
${companyName}

Readiness Score:
${
  readinessScore !== null && readinessScore !== undefined
    ? `${readinessScore}/100`
    : "Not assessed"
}

Readiness Level:
${readinessLevel || "Not assessed"}


IMPORTANT RULES

- Do not guarantee selection.
- Do not invent skills, projects, certifications or experience.
- Base your advice only on the information provided.
- Focus on practical placement preparation.
- Clearly prioritize missing required skills.
- Consider the student's readiness score.
- Keep the advice concise and useful.
- Use simple professional language.


FORMAT YOUR RESPONSE USING THESE SECTIONS:

## Profile Overview

Briefly summarize the student's current position for the selected role.

## Priority Skills

List the most important skills the student should focus on.

## Preparation Plan

Give a practical step-by-step preparation plan.

## Project Improvement

Suggest realistic project improvements relevant to the target role.

## Interview Preparation

Give technical and HR interview preparation suggestions.

## Short Advice

Give a short final recommendation for the student.
`;


  // =====================================================
  // Try Gemini models one by one
  // =====================================================

  let lastError = null;

  for (const model of GEMINI_MODELS) {

    console.log("------------------------------------");
    console.log("Trying Gemini model:", model);
    console.log("------------------------------------");

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            maxOutputTokens: 1500
          }
        })
      });


      const data = await response.json();


      // =================================================
      // Successful response
      // =================================================

      if (response.ok) {

        const parts =
          data?.candidates?.[0]?.content?.parts || [];

        const advice = parts
          .map(part => part.text || "")
          .join("")
          .trim();


        if (!advice) {
          throw new Error(
            "Gemini returned an empty response"
          );
        }


        console.log(
          "Gemini response received successfully from:",
          model
        );


        return advice;
      }


      // =================================================
      // API error
      // =================================================

      const errorMessage =
        data?.error?.message ||
        "Gemini API request failed";

      const errorCode =
        data?.error?.status || null;


      console.error(
        `Gemini model ${model} returned ${response.status}`
      );

      console.error(
        "Message:",
        errorMessage
      );

      console.error(
        "Code:",
        errorCode
      );


      lastError = new Error(errorMessage);

      lastError.status = response.status;
      lastError.code = errorCode;


      // -------------------------------------------------
      // If model unavailable / overloaded:
      // immediately try next model
      // -------------------------------------------------

      if (
        response.status === 503 ||
        response.status === 429
      ) {

        console.log(
          `Model ${model} unavailable. Trying fallback model...`
        );

        await sleep(1000);

        continue;
      }


      // -------------------------------------------------
      // Other API errors should stop immediately
      // -------------------------------------------------

      throw lastError;
    }

    catch (error) {

      lastError = error;

      console.error(
        `Gemini request failed for ${model}`
      );

      console.error(
        "Message:",
        error.message
      );


      // Network / temporary errors
      // Try the next model.

      if (
        error.status === 503 ||
        error.status === 429 ||
        !error.status
      ) {

        console.log(
          `Trying next Gemini model...`
        );

        await sleep(1000);

        continue;
      }


      throw error;
    }
  }


  // =====================================================
  // All models failed
  // =====================================================

  console.error("====================================");
  console.error("ALL GEMINI MODELS FAILED");
  console.error(
    "Message:",
    lastError?.message
  );
  console.error(
    "Code:",
    lastError?.code
  );
  console.error(
    "Status:",
    lastError?.status
  );
  console.error("====================================");


  const finalError = new Error(
    lastError?.message ||
    "All Gemini AI models are currently unavailable"
  );

  finalError.status =
    lastError?.status || 503;

  finalError.code =
    lastError?.code || "AI_UNAVAILABLE";


  throw finalError;
};


// =====================================================
// Export
// =====================================================

module.exports = {
  generatePreparationAdvice
};