// ======================================================
// CAREERREADY - STUDENT ROADMAP
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  const loadingState =
    document.getElementById("loadingState");

  const errorState =
    document.getElementById("errorState");

  const errorMessage =
    document.getElementById("errorMessage");

  const roadmapContent =
    document.getElementById("roadmapContent");

  const retryButton =
    document.getElementById("retryButton");

  const logoutButton =
    document.getElementById("logoutButton");

  const generateAIButton =
    document.getElementById("generateAIButton");


  // ======================================================
  // AUTHENTICATION
  // ======================================================

  const token =
    localStorage.getItem("careerReadyToken");

  if (!token) {
    window.location.href = "../login.html";
    return;
  }


  // ======================================================
  // LOGOUT
  // ======================================================

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      () => {

        localStorage.removeItem(
          "careerReadyToken"
        );

        localStorage.removeItem(
          "careerReadyUser"
        );

        window.location.href =
          "../login.html";
      }
    );

  }


  // ======================================================
  // HELPERS
  // ======================================================

  const escapeHTML = (value) => {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  };


  const formatCategory = (value) => {

    if (!value) {
      return "";
    }

    return String(value)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, char =>
        char.toUpperCase()
      );

  };


  const getReadinessScore = (readiness) => {

    if (!readiness) {
      return null;
    }

    if (
      readiness.score !== undefined &&
      readiness.score !== null
    ) {
      return Number(readiness.score);
    }

    if (
      readiness.overallScore !== undefined &&
      readiness.overallScore !== null
    ) {
      return Number(readiness.overallScore);
    }

    return null;

  };


  // ======================================================
  // LOAD ROADMAP
  // ======================================================

  const loadRoadmap = async () => {

    try {

      if (loadingState) {
        loadingState.classList.remove("hidden");
      }

      if (errorState) {
        errorState.classList.add("hidden");
      }

      if (roadmapContent) {
        roadmapContent.classList.add("hidden");
      }


      console.log(
        "CareerReady: Loading roadmap..."
      );


      const response =
        await window.apiRequest(
          "/roadmap"
        );


      console.log(
        "CareerReady: Roadmap API response:",
        response
      );


      if (
        !response ||
        !response.success
      ) {

        throw new Error(
          response?.message ||
          "Failed to load roadmap"
        );

      }


      renderRoadmap(response);


      if (loadingState) {
        loadingState.classList.add("hidden");
      }

      if (roadmapContent) {
        roadmapContent.classList.remove(
          "hidden"
        );
      }


    } catch (error) {

      console.error(
        "ROADMAP LOAD ERROR:",
        error
      );


      if (loadingState) {
        loadingState.classList.add("hidden");
      }


      if (errorMessage) {

        errorMessage.textContent =
          error.message ||
          "Unable to load your roadmap.";

      }


      if (errorState) {
        errorState.classList.remove(
          "hidden"
        );
      }

    }

  };


  // ======================================================
  // RENDER ROADMAP
  // ======================================================

  const renderRoadmap = (response) => {

    console.log(
      "CareerReady: Rendering roadmap:",
      response
    );


    /*
      Support both possible response formats:

      {
        success: true,
        roadmap: {...},
        readiness: {...},
        mentorRecommendations: [...]
      }

      OR

      {
        success: true,
        data: {
          roadmap: {...}
        }
      }
    */

    const data =
      response.data || response;


    const roadmap =
      data.roadmap || {};


    const readiness =
      data.readiness || {};


    const mentorRecommendations =
      data.mentorRecommendations || [];


    // ====================================================
    // ACADEMIC POSITION
    // ====================================================

    const academicPosition =
      document.getElementById(
        "academicPosition"
      );

    if (academicPosition) {

      academicPosition.textContent =
        `Year ${roadmap.academicYear || "--"} • Semester ${roadmap.currentSemester || "--"}`;

    }


    // ====================================================
    // PROGRAM
    // ====================================================

    const programDuration =
      document.getElementById(
        "programDuration"
      );

    if (programDuration) {

      programDuration.textContent =
        roadmap.programDuration
          ? `${roadmap.programDuration} Years`
          : "--";

    }


    // ====================================================
    // ACADEMIC YEAR
    // ====================================================

    const academicYear =
      document.getElementById(
        "academicYear"
      );

    if (academicYear) {

      academicYear.textContent =
        roadmap.academicYear
          ? `Year ${roadmap.academicYear}`
          : "--";

    }


    // ====================================================
    // SEMESTER
    // ====================================================

    const semester =
      document.getElementById(
        "semester"
      );

    if (semester) {

      semester.textContent =
        roadmap.currentSemester
          ? `Semester ${roadmap.currentSemester}`
          : "--";

    }


    // ====================================================
    // READINESS
    // ====================================================

    const readinessScore =
      document.getElementById(
        "readinessScore"
      );


    const score =
      getReadinessScore(readiness);


    if (readinessScore) {

      readinessScore.textContent =
        score !== null &&
        !Number.isNaN(score)
          ? `${Math.round(score)}/100`
          : "Not Assessed";

    }


    // ====================================================
    // STAGE BADGE
    // ====================================================

    const stageBadge =
      document.getElementById(
        "stageBadge"
      );

    if (stageBadge) {

      stageBadge.textContent =
        formatCategory(
          roadmap.stage
        );

    }


    // ====================================================
    // CURRENT STAGE TITLE
    // ====================================================

    const currentStageTitle =
      document.getElementById(
        "currentStageTitle"
      );

    if (currentStageTitle) {

      currentStageTitle.textContent =
        roadmap.stageTitle ||
        "Current Academic Stage";

    }


    // ====================================================
    // STAGE DESCRIPTION
    // ====================================================

    const stageDescription =
      document.getElementById(
        "stageDescription"
      );

    if (stageDescription) {

      stageDescription.textContent =
        roadmap.description ||
        "Your roadmap is based on your current academic stage.";

    }


    // ====================================================
    // FINAL STAGE MESSAGE
    // ====================================================

    const finalStageMessage =
      document.getElementById(
        "finalStageMessage"
      );

    const finalStageText =
      document.getElementById(
        "finalStageText"
      );


    if (
      roadmap.isFinalSemester
    ) {

      if (finalStageMessage) {
        finalStageMessage.classList.remove(
          "hidden"
        );
      }

      if (finalStageText) {

        finalStageText.textContent =
          "You are currently in the final semester of your program. Focus on placement execution and completing your remaining career goals.";

      }

    } else if (
      roadmap.isFinalYear
    ) {

      if (finalStageMessage) {
        finalStageMessage.classList.remove(
          "hidden"
        );
      }

      if (finalStageText) {

        finalStageText.textContent =
          "You are in your final academic year. Placement preparation should now be a major priority.";

      }

    } else {

      if (finalStageMessage) {
        finalStageMessage.classList.add(
          "hidden"
        );
      }

    }


    // ====================================================
    // LEARNING
    // ====================================================

    renderSimpleList(
      "learningList",
      roadmap.learning || []
    );


    // ====================================================
    // PLACEMENT FOCUS
    // ====================================================

    renderSimpleList(
      "placementFocusList",
      roadmap.placementFocus || []
    );


    // ====================================================
    // PROJECTS
    // ====================================================

    renderProjects(
      roadmap.projects || []
    );


    // ====================================================
    // CERTIFICATIONS
    // ====================================================

    renderCertifications(
      roadmap.certifications || []
    );


    // ====================================================
    // MENTOR RECOMMENDATIONS
    // ====================================================

    renderMentorRecommendations(
      mentorRecommendations
    );

  };


  // ======================================================
  // SIMPLE LIST
  // ======================================================

  const renderSimpleList = (
    elementId,
    items
  ) => {

    const container =
      document.getElementById(
        elementId
      );


    if (!container) {
      return;
    }


    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {

      container.innerHTML = `
        <p class="text-sm text-slate-500 py-4">
          No recommendations available yet.
        </p>
      `;

      return;
    }


    container.innerHTML =
      items
        .map(item => {

          return `
            <div class="roadmap-item">

              <div class="check-icon">
                ✓
              </div>

              <p class="text-sm text-slate-300">
                ${escapeHTML(item)}
              </p>

            </div>
          `;

        })
        .join("");

  };


  // ======================================================
  // PROJECTS
  // ======================================================

  const renderProjects = (
    projects
  ) => {

    const container =
      document.getElementById(
        "projectsList"
      );


    if (!container) {
      return;
    }


    if (
      !Array.isArray(projects) ||
      projects.length === 0
    ) {

      container.innerHTML = `
        <p class="text-sm text-slate-500 py-4">
          No project recommendations available yet.
        </p>
      `;

      return;
    }


    container.innerHTML =
      projects
        .map(project => {

          return `
            <div class="roadmap-item">

              <div class="check-icon">
                ✓
              </div>

              <p class="text-sm text-slate-300">
                ${escapeHTML(project)}
              </p>

            </div>
          `;

        })
        .join("");

  };


  // ======================================================
  // CERTIFICATIONS
  // ======================================================

  const renderCertifications = (
    certifications
  ) => {

    const container =
      document.getElementById(
        "certificationsList"
      );


    if (!container) {
      return;
    }


    if (
      !Array.isArray(certifications) ||
      certifications.length === 0
    ) {

      container.innerHTML = `
        <p class="text-sm text-slate-500 py-4">
          No certification recommendations available yet.
        </p>
      `;

      return;
    }


    container.innerHTML =
      certifications
        .map(certification => {

          return `
            <div
              class="rounded-xl
                     border
                     border-slate-800
                     bg-slate-900
                     p-4"
            >

              <div
                class="flex
                       items-center
                       gap-3"
              >

                <div
                  class="w-9 h-9
                         rounded-lg
                         bg-blue-500/10
                         text-blue-400
                         flex
                         items-center
                         justify-center"
                >
                  ✓
                </div>

                <p
                  class="text-sm
                         text-slate-300"
                >
                  ${escapeHTML(certification)}
                </p>

              </div>

            </div>
          `;

        })
        .join("");

  };


  // ======================================================
  // MENTOR RECOMMENDATIONS
  // ======================================================

  const renderMentorRecommendations = (
    recommendations
  ) => {

    const container =
      document.getElementById(
        "mentorRecommendations"
      );

    const count =
      document.getElementById(
        "mentorCount"
      );


    if (!container) {
      return;
    }


    const list =
      Array.isArray(recommendations)
        ? recommendations
        : [];


    if (count) {

      count.textContent =
        `${list.length} ${
          list.length === 1
            ? "recommendation"
            : "recommendations"
        }`;

    }


    if (list.length === 0) {

      container.innerHTML = `
        <div
          class="rounded-xl
                 bg-slate-900
                 border border-slate-800
                 p-6"
        >

          <p
            class="font-semibold
                   text-slate-300"
          >
            No mentor recommendations yet.
          </p>

          <p
            class="text-sm
                   text-slate-500
                   mt-1"
          >
            Your mentor's recommendations will appear here.
          </p>

        </div>
      `;

      return;
    }


    container.innerHTML =
      list
        .map(item => {

          const mentorName =
            item.mentor?.name ||
            "Mentor";

          const priority =
            item.priority ||
            "MEDIUM";

          const category =
            formatCategory(
              item.category
            );

          const skills =
            Array.isArray(item.skills)
              ? item.skills
              : [];


          return `
            <div
              class="rounded-xl
                     bg-slate-900
                     border border-slate-800
                     p-5"
            >

              <div
                class="flex
                       items-start
                       justify-between
                       gap-4"
              >

                <div>

                  <div
                    class="flex
                           flex-wrap
                           gap-2"
                  >

                    <span
                      class="text-xs
                             px-2.5
                             py-1
                             rounded-full
                             bg-purple-500/10
                             text-purple-300"
                    >
                      ${escapeHTML(category)}
                    </span>

                    <span
                      class="text-xs
                             px-2.5
                             py-1
                             rounded-full
                             bg-blue-500/10
                             text-blue-300"
                    >
                      ${escapeHTML(priority)}
                    </span>

                  </div>


                  <h4
                    class="text-lg
                           font-bold
                           text-slate-200
                           mt-3"
                  >
                    ${escapeHTML(item.title)}
                  </h4>


                  <p
                    class="text-sm
                           text-slate-400
                           mt-2"
                  >
                    ${escapeHTML(item.recommendation)}
                  </p>

                </div>

              </div>


              ${
                item.suggestedProject
                  ? `
                    <div class="mt-4">

                      <p
                        class="text-xs
                               text-slate-500"
                      >
                        Suggested Project
                      </p>

                      <p
                        class="text-sm
                               text-slate-300
                               mt-1"
                      >
                        ${escapeHTML(
                          item.suggestedProject
                        )}
                      </p>

                    </div>
                  `
                  : ""
              }


              ${
                skills.length
                  ? `
                    <div
                      class="flex
                             flex-wrap
                             gap-2
                             mt-4"
                    >

                      ${skills
                        .map(skill => `
                          <span
                            class="text-xs
                                   px-2.5
                                   py-1
                                   rounded-full
                                   bg-slate-800
                                   text-slate-400"
                          >
                            ${escapeHTML(skill)}
                          </span>
                        `)
                        .join("")}

                    </div>
                  `
                  : ""
              }


              <p
                class="text-xs
                       text-slate-600
                       mt-4"
              >
                Recommended by
                ${escapeHTML(mentorName)}
              </p>

            </div>
          `;

        })
        .join("");

  };


  // ======================================================
  // AI ROADMAP
  // ======================================================

  if (generateAIButton) {

    generateAIButton.addEventListener(
      "click",
      async () => {

        const targetRole =
          document
            .getElementById("targetRole")
            ?.value
            .trim();


        const aiLoading =
          document.getElementById(
            "aiLoading"
          );

        const aiError =
          document.getElementById(
            "aiError"
          );

        const aiErrorMessage =
          document.getElementById(
            "aiErrorMessage"
          );

        const aiResult =
          document.getElementById(
            "aiResult"
          );

        const aiAdvice =
          document.getElementById(
            "aiAdvice"
          );


        if (!targetRole) {

          if (aiErrorMessage) {

            aiErrorMessage.textContent =
              "Please enter a target role first.";

          }

          if (aiError) {
            aiError.classList.remove(
              "hidden"
            );
          }

          return;
        }


        if (aiError) {
          aiError.classList.add("hidden");
        }

        if (aiResult) {
          aiResult.classList.add("hidden");
        }

        if (aiLoading) {
          aiLoading.classList.remove("hidden");
        }


        generateAIButton.disabled = true;

        generateAIButton.textContent =
          "Generating...";


        try {

          const response =
            await window.apiRequest(
              "/roadmap/ai",
              {
                method: "POST",

                body: JSON.stringify({
                  targetRole
                })
              }
            );


          console.log(
            "AI ROADMAP RESPONSE:",
            response
          );


          if (
            !response ||
            !response.success
          ) {

            throw new Error(
              response?.message ||
              "Failed to generate AI roadmap"
            );

          }


          const advice =
            response.data?.advice ||
            response.advice ||
            "";


          if (!advice) {

            throw new Error(
              "AI returned an empty roadmap."
            );

          }


          if (aiAdvice) {
            aiAdvice.textContent =
              advice;
          }

          if (aiResult) {
            aiResult.classList.remove(
              "hidden"
            );
          }


        } catch (error) {

          console.error(
            "AI ROADMAP ERROR:",
            error
          );


          if (aiErrorMessage) {

            aiErrorMessage.textContent =
              error.message ||
              "Unable to generate AI roadmap.";

          }

          if (aiError) {
            aiError.classList.remove(
              "hidden"
            );
          }

        } finally {

          if (aiLoading) {
            aiLoading.classList.add(
              "hidden"
            );
          }

          generateAIButton.disabled =
            false;

          generateAIButton.textContent =
            "Generate AI Roadmap";

        }

      }
    );

  }


  // ======================================================
  // RETRY
  // ======================================================

  if (retryButton) {

    retryButton.addEventListener(
      "click",
      loadRoadmap
    );

  }


  // ======================================================
  // INITIAL LOAD
  // ======================================================

  loadRoadmap();

});