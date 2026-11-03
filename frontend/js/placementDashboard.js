// ============================================================
// CareerReady - Placement Dashboard
// ============================================================

// ============================================================
// GLOBAL VARIABLES
// ============================================================

let selectedProfileId = null;
let selectedDriveId = null;


// ============================================================
// LOAD PLACEMENT DASHBOARD
// ============================================================

const loadPlacementDashboard = async () => {

  const loading =
    document.getElementById("dashboardLoading");

  const errorContainer =
    document.getElementById("dashboardError");

  const content =
    document.getElementById("dashboardContent");

  try {

    // --------------------------------------------------------
    // Check user
    // --------------------------------------------------------

    const user =
      JSON.parse(
        localStorage.getItem("careerReadyUser")
      );

    if (
      !user ||
      user.role !== "PLACEMENT"
    ) {

      window.location.href = "../login.html";

      return;
    }


    // --------------------------------------------------------
    // Placement user information
    // --------------------------------------------------------

    const placementName =
      document.getElementById("placementName");

    const placementEmail =
      document.getElementById("placementEmail");


    if (placementName) {

      placementName.textContent =
        user.name ||
        "Placement Cell";

    }


    if (placementEmail) {

      placementEmail.textContent =
        user.email ||
        "";

    }


    // --------------------------------------------------------
    // Fetch dashboard APIs
    // --------------------------------------------------------

    const [
      readinessData,
      skillGapData,
      applicationData
    ] = await Promise.all([

      apiRequest(
        "/placement-dashboard/readiness"
      ),

      apiRequest(
        "/placement-dashboard/skill-gaps"
      ),

      apiRequest(
        "/placement-dashboard/application-summary"
      )

    ]);


    const dashboard =
      readinessData.dashboard;


    // --------------------------------------------------------
    // Overview
    // --------------------------------------------------------

    document.getElementById(
      "totalStudents"
    ).textContent =
      dashboard.totalStudents;


    document.getElementById(
      "verifiedProfiles"
    ).textContent =
      dashboard.verifiedProfiles;


    document.getElementById(
      "assessedStudents"
    ).textContent =
      dashboard.assessedStudents;


    document.getElementById(
      "averageReadiness"
    ).textContent =
      dashboard.averageReadinessScore ?? "--";


    // --------------------------------------------------------
    // Readiness
    // --------------------------------------------------------

    document.getElementById(
      "highlyReady"
    ).textContent =
      dashboard.readinessSummary.HIGHLY_READY;


    document.getElementById(
      "moderatelyReady"
    ).textContent =
      dashboard.readinessSummary.MODERATELY_READY;


    document.getElementById(
      "needsPreparation"
    ).textContent =
      dashboard.readinessSummary.NEEDS_PREPARATION;


    document.getElementById(
      "notReady"
    ).textContent =
      dashboard.readinessSummary.NOT_READY;


    document.getElementById(
      "notAssessed"
    ).textContent =
      dashboard.readinessSummary.NOT_ASSESSED;


    // --------------------------------------------------------
    // Skill gaps
    // --------------------------------------------------------

    renderSkillGaps(
      skillGapData.skillGaps
    );


    // --------------------------------------------------------
    // Applications
    // --------------------------------------------------------

    const applications =
      applicationData.applicationSummary;


    document.getElementById(
      "registered"
    ).textContent =
      applications.REGISTERED;


    document.getElementById(
      "shortlisted"
    ).textContent =
      applications.SHORTLISTED;


    document.getElementById(
      "assessment"
    ).textContent =
      applications.ASSESSMENT;


    document.getElementById(
      "interview"
    ).textContent =
      applications.INTERVIEW;


    document.getElementById(
      "selected"
    ).textContent =
      applications.SELECTED;


    document.getElementById(
      "rejected"
    ).textContent =
      applications.REJECTED;


    // --------------------------------------------------------
    // Show dashboard
    // --------------------------------------------------------

    if (loading) {
      loading.classList.add("hidden");
    }

    if (content) {
      content.classList.remove("hidden");
    }


  } catch (error) {

    if (loading) {
      loading.classList.add("hidden");
    }

    if (errorContainer) {

      errorContainer.textContent =
        error.message ||
        "Failed to load placement dashboard.";

      errorContainer.classList.remove("hidden");

    }

  }

};


// ============================================================
// RENDER SKILL GAPS
// ============================================================

const renderSkillGaps = (
  skillGaps = []
) => {

  const container =
    document.getElementById("skillGaps");


  if (!container) {
    return;
  }


  if (!skillGaps.length) {

    container.innerHTML = `

      <div
        class="col-span-full
               rounded-2xl
               border
               border-slate-800
               bg-slate-900
               p-6">

        <p class="text-emerald-400">

          No common skill gaps found.

        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    skillGaps
      .map(
        item => `

          <div
            class="rounded-2xl
                   border
                   border-slate-800
                   bg-slate-900
                   p-5">

            <p
              class="text-lg
                     font-semibold">

              ${escapeHtml(
                item.skill
              )}

            </p>


            <p
              class="text-sm
                     text-slate-500
                     mt-2">

              Missing in

              <span
                class="text-red-400
                       font-medium">

                ${item.studentCount}

              </span>

              student(s)

            </p>

          </div>

        `
      )
      .join("");

};


// ============================================================
// ESCAPE HTML
// ============================================================

const escapeHtml = (
  value
) => {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

};


// ============================================================
// PROFILE REVIEW MESSAGE
// ============================================================

const showProfileReviewMessage = (
  message,
  type = "success"
) => {

  const box =
    document.getElementById(
      "profileReviewMessage"
    );


  if (!box) {
    return;
  }


  if (type === "success") {

    box.className =
      "mb-5 rounded-xl p-4 text-sm " +
      "bg-green-500/10 " +
      "text-green-300 " +
      "border border-green-500/30";

  } else {

    box.className =
      "mb-5 rounded-xl p-4 text-sm " +
      "bg-red-500/10 " +
      "text-red-300 " +
      "border border-red-500/30";

  }


  box.textContent =
    message;


  box.classList.remove("hidden");


  setTimeout(
    () => {

      box.classList.add("hidden");

    },
    5000
  );

};


// ============================================================
// LOAD SUBMITTED PROFILES
// ============================================================

const loadSubmittedProfiles = async () => {

  const loading =
    document.getElementById(
      "profilesLoading"
    );

  const empty =
    document.getElementById(
      "profilesEmpty"
    );

  const container =
    document.getElementById(
      "submittedProfilesContainer"
    );


  if (
    !loading ||
    !empty ||
    !container
  ) {

    return;

  }


  try {

    loading.classList.remove("hidden");

    empty.classList.add("hidden");

    container.classList.add("hidden");


    const response =
      await apiRequest(
        "/placement/profiles"
      );


    const profiles =
      Array.isArray(
        response.profiles
      )
        ? response.profiles
        : [];


    container.innerHTML = "";


    if (profiles.length === 0) {

      loading.classList.add("hidden");

      empty.classList.remove("hidden");

      return;

    }


    profiles.forEach(
      profile => {

        const student =
          profile.user || {};


        const card =
          document.createElement("div");


        card.className =
          "rounded-2xl " +
          "border border-slate-800 " +
          "bg-slate-900 " +
          "p-5";


        card.innerHTML = `

          <div
            class="flex
                   flex-col
                   lg:flex-row
                   lg:items-center
                   lg:justify-between
                   gap-5">

            <div>

              <h4
                class="text-lg
                       font-semibold">

                ${escapeHtml(
                  student.name ||
                  "Student"
                )}

              </h4>


              <p
                class="text-sm
                       text-slate-500
                       mt-1">

                ${escapeHtml(
                  student.email ||
                  "--"
                )}

              </p>


              <div
                class="flex
                       flex-wrap
                       gap-2
                       mt-3">

                <span
                  class="px-3
                         py-1
                         rounded-full
                         bg-blue-500/10
                         text-blue-300
                         text-xs">

                  ${escapeHtml(
                    profile.university ||
                    "--"
                  )}

                </span>


                <span
                  class="px-3
                         py-1
                         rounded-full
                         bg-purple-500/10
                         text-purple-300
                         text-xs">

                  ${escapeHtml(
                    profile.degree ||
                    "--"
                  )}

                </span>


                <span
                  class="px-3
                         py-1
                         rounded-full
                         bg-amber-500/10
                         text-amber-300
                         text-xs">

                  SUBMITTED

                </span>

              </div>

            </div>


            <button
              type="button"
              class="view-profile-button
                     rounded-xl
                     bg-blue-600
                     hover:bg-blue-700
                     px-5
                     py-3
                     font-semibold
                     transition"
              data-profile-id="${profile._id}">

              View Profile →

            </button>

          </div>

        `;


        container.appendChild(card);

      }
    );


    loading.classList.add("hidden");

    container.classList.remove("hidden");


  } catch (error) {

    loading.classList.add("hidden");

    showProfileReviewMessage(
      error.message ||
      "Failed to load submitted profiles.",
      "error"
    );

  }

};


// ============================================================
// OPEN SUBMITTED PROFILE
// ============================================================

const openProfileReview = async (
  profileId
) => {

  try {

    selectedProfileId =
      profileId;


    const commentsContainer =
      document.getElementById(
        "reviewComments"
      );


    if (commentsContainer) {

      commentsContainer.parentElement
        .classList.remove("hidden");

    }


    const verifyButton =
      document.getElementById(
        "verifyProfileButton"
      );


    if (verifyButton) {

      verifyButton.classList.remove(
        "hidden"
      );

    }


    const correctionButton =
      document.getElementById(
        "correctionProfileButton"
      );


    if (correctionButton) {

      correctionButton.classList.remove(
        "hidden"
      );

    }


    const response =
      await apiRequest(
        "/placement/profiles"
      );


    const profile =
      response.profiles.find(
        item =>
          item._id === profileId
      );


    if (!profile) {

      throw new Error(
        "Student profile not found."
      );

    }


    const student =
      profile.user || {};


    // --------------------------------------------------------
    // Basic information
    // --------------------------------------------------------

    document.getElementById(
      "reviewStudentName"
    ).textContent =
      student.name ||
      "Student";


    document.getElementById(
      "reviewStudentEmail"
    ).textContent =
      student.email ||
      "--";


    // --------------------------------------------------------
    // Academic information
    // --------------------------------------------------------

    document.getElementById(
      "reviewUniversity"
    ).textContent =
      profile.university ||
      "--";


    document.getElementById(
      "reviewDegree"
    ).textContent =
      profile.degree ||
      "--";


    document.getElementById(
      "reviewSpecialization"
    ).textContent =
      profile.specialization ||
      "--";


    document.getElementById(
      "reviewGraduationYear"
    ).textContent =
      profile.graduationYear ||
      "--";


    document.getElementById(
      "reviewCgpa"
    ).textContent =
      profile.cgpa ??
      "--";


    const statusElement =
      document.getElementById(
        "reviewProfileStatus"
      );


    if (statusElement) {

      statusElement.textContent =
        profile.profileStatus ||
        "SUBMITTED";


      statusElement.className =
        "font-medium mt-1 text-yellow-400";

    }


    // --------------------------------------------------------
    // Skills
    // --------------------------------------------------------

    const skillsContainer =
      document.getElementById(
        "reviewSkills"
      );


    if (skillsContainer) {

      skillsContainer.innerHTML = "";


      if (
        profile.skills &&
        profile.skills.length
      ) {

        profile.skills.forEach(
          skill => {

            const badge =
              document.createElement(
                "span"
              );


            badge.className =
              "px-3 py-1 " +
              "rounded-full " +
              "bg-blue-500/10 " +
              "text-blue-300 " +
              "text-sm";


            badge.textContent =
              skill;


            skillsContainer.appendChild(
              badge
            );

          }
        );

      } else {

        skillsContainer.innerHTML = `

          <span class="text-slate-500">

            No skills added.

          </span>

        `;

      }

    }


    renderCertifications(
      profile.certifications
    );


    renderProjects(
      profile.projects
    );


    renderExperience(
      profile.experience
    );


    const reviewComments =
      document.getElementById(
        "reviewComments"
      );


    if (reviewComments) {

      reviewComments.value = "";

    }


    document.getElementById(
      "profileReviewModal"
    ).classList.remove("hidden");


  } catch (error) {

    showProfileReviewMessage(
      error.message ||
      "Failed to open student profile.",
      "error"
    );

  }

};


// ============================================================
// RENDER CERTIFICATIONS
// ============================================================

const renderCertifications = (
  certifications = []
) => {

  const container =
    document.getElementById(
      "reviewCertifications"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!certifications.length) {

    container.innerHTML = `

      <p class="text-slate-500">

        No certifications added.

      </p>

    `;

    return;

  }


  certifications.forEach(
    cert => {

      const item =
        document.createElement("div");


      item.className =
        "rounded-xl " +
        "bg-slate-800/60 " +
        "p-4";


      item.innerHTML = `

        <p class="font-semibold">

          ${escapeHtml(
            cert.name
          )}

        </p>


        <p
          class="text-sm
                 text-slate-400
                 mt-1">

          ${escapeHtml(
            cert.provider ||
            "--"
          )}

        </p>


        ${
          cert.credentialId
            ? `

              <p
                class="text-xs
                       text-slate-500
                       mt-2">

                Credential ID:
                ${escapeHtml(
                  cert.credentialId
                )}

              </p>

            `
            : ""
        }

      `;


      container.appendChild(item);

    }
  );

};


// ============================================================
// RENDER PROJECTS
// ============================================================

const renderProjects = (
  projects = []
) => {

  const container =
    document.getElementById(
      "reviewProjects"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!projects.length) {

    container.innerHTML = `

      <p class="text-slate-500">

        No projects added.

      </p>

    `;

    return;

  }


  projects.forEach(
    project => {

      const item =
        document.createElement("div");


      item.className =
        "rounded-xl " +
        "bg-slate-800/60 " +
        "p-4";


      item.innerHTML = `

        <p class="font-semibold">

          ${escapeHtml(
            project.title
          )}

        </p>


        <p
          class="text-sm
                 text-slate-400
                 mt-2">

          ${escapeHtml(
            project.description ||
            ""
          )}

        </p>


        <p
          class="text-xs
                 text-blue-300
                 mt-3">

          ${escapeHtml(
            (
              project.technologies ||
              []
            ).join(", ")
          )}

        </p>

      `;


      container.appendChild(item);

    }
  );

};


// ============================================================
// RENDER EXPERIENCE
// ============================================================

const renderExperience = (
  experience = []
) => {

  const container =
    document.getElementById(
      "reviewExperience"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!experience.length) {

    container.innerHTML = `

      <span class="text-slate-500">

        No experience/exposure added.

      </span>

    `;

    return;

  }


  experience.forEach(
    item => {

      const badge =
        document.createElement(
          "span"
        );


      badge.className =
        "px-3 py-1 " +
        "rounded-full " +
        "bg-purple-500/10 " +
        "text-purple-300 " +
        "text-sm";


      badge.textContent =
        typeof item === "object"
          ? item.type || "Experience"
          : item;


      container.appendChild(
        badge
      );

    }
  );

};


// ============================================================
// SUBMIT PROFILE REVIEW
// ============================================================

const submitProfileReview = async (
  decision
) => {

  if (!selectedProfileId) {
    return;
  }


  const commentsElement =
    document.getElementById(
      "reviewComments"
    );


  const comments =
    commentsElement
      ? commentsElement.value.trim()
      : "";


  try {

    const response =
      await apiRequest(

        `/placement/profiles/${selectedProfileId}/review`,

        {

          method: "POST",

          body: JSON.stringify({

            decision,

            comments

          })

        }

      );


    document.getElementById(
      "profileReviewModal"
    ).classList.add("hidden");


    selectedProfileId =
      null;


    showProfileReviewMessage(
      response.message ||
      "Profile review completed.",
      "success"
    );


    await loadSubmittedProfiles();

    await loadVerifiedProfiles();

    await loadPlacementDashboard();


  } catch (error) {

    showProfileReviewMessage(
      error.message ||
      "Failed to review profile.",
      "error"
    );

  }

};


// ============================================================
// LOAD VERIFIED PROFILES
// ============================================================

const loadVerifiedProfiles = async () => {

  const loading =
    document.getElementById(
      "verifiedProfilesLoading"
    );

  const empty =
    document.getElementById(
      "verifiedProfilesEmpty"
    );

  const container =
    document.getElementById(
      "verifiedProfilesContainer"
    );


  if (
    !loading ||
    !empty ||
    !container
  ) {

    return;

  }


  try {

    loading.classList.remove("hidden");

    empty.classList.add("hidden");

    container.classList.add("hidden");


    const response =
      await apiRequest(
        "/placement/profiles/verified"
      );


    const profiles =
      Array.isArray(
        response.profiles
      )
        ? response.profiles
        : [];


    container.innerHTML = "";


    if (profiles.length === 0) {

      loading.classList.add("hidden");

      empty.classList.remove("hidden");

      return;

    }


    profiles.forEach(
      profile => {

        const student =
          profile.user || {};


        const card =
          document.createElement("div");


        card.className =
          "rounded-2xl " +
          "border border-slate-800 " +
          "bg-slate-900 " +
          "p-6";


        card.innerHTML = `

          <div
            class="flex
                   items-start
                   justify-between
                   gap-4">

            <div>

              <h4
                class="text-lg
                       font-semibold">

                ${escapeHtml(
                  student.name ||
                  "Student"
                )}

              </h4>


              <p
                class="text-sm
                       text-slate-500
                       mt-1">

                ${escapeHtml(
                  student.email ||
                  "--"
                )}

              </p>

            </div>


            <span
              class="px-3
                     py-1
                     rounded-full
                     bg-green-500/10
                     text-green-400
                     text-xs
                     font-medium">

              VERIFIED

            </span>

          </div>


          <div
            class="grid
                   grid-cols-2
                   gap-3
                   mt-5">


            <div
              class="rounded-xl
                     bg-slate-800/60
                     p-4">

              <p
                class="text-xs
                       text-slate-500">

                University

              </p>

              <p
                class="text-sm
                       font-medium
                       mt-1">

                ${escapeHtml(
                  profile.university ||
                  "--"
                )}

              </p>

            </div>


            <div
              class="rounded-xl
                     bg-slate-800/60
                     p-4">

              <p
                class="text-xs
                       text-slate-500">

                Degree

              </p>

              <p
                class="text-sm
                       font-medium
                       mt-1">

                ${escapeHtml(
                  profile.degree ||
                  "--"
                )}

              </p>

            </div>


            <div
              class="rounded-xl
                     bg-slate-800/60
                     p-4">

              <p
                class="text-xs
                       text-slate-500">

                Specialization

              </p>

              <p
                class="text-sm
                       font-medium
                       mt-1">

                ${escapeHtml(
                  profile.specialization ||
                  "--"
                )}

              </p>

            </div>


            <div
              class="rounded-xl
                     bg-slate-800/60
                     p-4">

              <p
                class="text-xs
                       text-slate-500">

                CGPA

              </p>

              <p
                class="text-sm
                       font-medium
                       mt-1">

                ${profile.cgpa ?? "--"}

              </p>

            </div>

          </div>


          <div class="mt-5">

            <p
              class="text-xs
                     text-slate-500
                     mb-2">

              Skills

            </p>


            <div
              class="flex
                     flex-wrap
                     gap-2">

              ${
                profile.skills &&
                profile.skills.length

                  ? profile.skills
                      .map(
                        skill => `

                          <span
                            class="px-3
                                   py-1
                                   rounded-full
                                   bg-blue-500/10
                                   text-blue-300
                                   text-xs">

                            ${escapeHtml(
                              skill
                            )}

                          </span>

                        `
                      )
                      .join("")

                  : `

                      <span
                        class="text-slate-500
                               text-sm">

                        No skills added.

                      </span>

                    `
              }

            </div>

          </div>


          <button
            type="button"
            class="verified-view-profile
                   w-full
                   mt-5
                   rounded-xl
                   border
                   border-slate-700
                   px-4
                   py-3
                   text-sm
                   font-medium
                   hover:bg-slate-800
                   transition"
            data-profile-id="${profile._id}">

            View Verified Profile →

          </button>

        `;


        container.appendChild(card);

      }
    );


    loading.classList.add("hidden");

    container.classList.remove("hidden");


  } catch (error) {

    loading.classList.add("hidden");

    showProfileReviewMessage(
      error.message ||
      "Failed to load verified profiles.",
      "error"
    );

  }

};


// ============================================================
// OPEN VERIFIED PROFILE
// ============================================================

const openVerifiedProfile = async (
  profileId
) => {

  try {

    selectedProfileId =
      profileId;


    const response =
      await apiRequest(
        "/placement/profiles/verified"
      );


    const profile =
      response.profiles.find(
        item =>
          item._id === profileId
      );


    if (!profile) {

      throw new Error(
        "Verified student profile not found."
      );

    }


    const student =
      profile.user || {};


    document.getElementById(
      "reviewStudentName"
    ).textContent =
      student.name ||
      "Student";


    document.getElementById(
      "reviewStudentEmail"
    ).textContent =
      student.email ||
      "--";


    document.getElementById(
      "reviewUniversity"
    ).textContent =
      profile.university ||
      "--";


    document.getElementById(
      "reviewDegree"
    ).textContent =
      profile.degree ||
      "--";


    document.getElementById(
      "reviewSpecialization"
    ).textContent =
      profile.specialization ||
      "--";


    document.getElementById(
      "reviewGraduationYear"
    ).textContent =
      profile.graduationYear ||
      "--";


    document.getElementById(
      "reviewCgpa"
    ).textContent =
      profile.cgpa ??
      "--";


    const statusElement =
      document.getElementById(
        "reviewProfileStatus"
      );


    if (statusElement) {

      statusElement.textContent =
        "VERIFIED";


      statusElement.className =
        "font-medium mt-1 text-green-400";

    }


    const skillsContainer =
      document.getElementById(
        "reviewSkills"
      );


    if (skillsContainer) {

      skillsContainer.innerHTML = "";


      if (
        profile.skills &&
        profile.skills.length
      ) {

        profile.skills.forEach(
          skill => {

            const badge =
              document.createElement(
                "span"
              );


            badge.className =
              "px-3 py-1 " +
              "rounded-full " +
              "bg-blue-500/10 " +
              "text-blue-300 " +
              "text-sm";


            badge.textContent =
              skill;


            skillsContainer.appendChild(
              badge
            );

          }
        );

      } else {

        skillsContainer.innerHTML = `

          <span class="text-slate-500">

            No skills added.

          </span>

        `;

      }

    }


    renderCertifications(
      profile.certifications
    );


    renderProjects(
      profile.projects
    );


    renderExperience(
      profile.experience
    );


    const commentsContainer =
      document.getElementById(
        "reviewComments"
      );


    if (commentsContainer) {

      commentsContainer.parentElement
        .classList.add("hidden");

    }


    const verifyButton =
      document.getElementById(
        "verifyProfileButton"
      );


    if (verifyButton) {

      verifyButton.classList.add("hidden");

    }


    const correctionButton =
      document.getElementById(
        "correctionProfileButton"
      );


    if (correctionButton) {

      correctionButton.classList.add("hidden");

    }


    document.getElementById(
      "profileReviewModal"
    ).classList.remove("hidden");


  } catch (error) {

    showProfileReviewMessage(
      error.message ||
      "Failed to open verified profile.",
      "error"
    );

  }

};


// ============================================================
// ============================================================
// RECRUITMENT DRIVE MANAGEMENT
// ============================================================
// ============================================================


// ============================================================
// DRIVE MESSAGE
// ============================================================

const showDriveMessage = (
  message,
  type = "success"
) => {

  const box =
    document.getElementById(
      "driveMessage"
    );


  if (!box) {

    showProfileReviewMessage(
      message,
      type
    );

    return;

  }


  if (type === "success") {

    box.className =
      "mb-5 rounded-xl p-4 text-sm " +
      "bg-green-500/10 " +
      "text-green-300 " +
      "border border-green-500/30";

  } else {

    box.className =
      "mb-5 rounded-xl p-4 text-sm " +
      "bg-red-500/10 " +
      "text-red-300 " +
      "border border-red-500/30";

  }


  box.textContent =
    message;


  box.classList.remove("hidden");


  setTimeout(
    () => {

      box.classList.add("hidden");

    },
    5000
  );

};


// ============================================================
// LOAD RECRUITMENT DRIVES
// ============================================================

const loadRecruitmentDrives = async () => {

  const loading =
    document.getElementById(
      "drivesLoading"
    );

  const empty =
    document.getElementById(
      "drivesEmpty"
    );

  const container =
    document.getElementById(
      "drivesContainer"
    );


  if (
    !loading ||
    !empty ||
    !container
  ) {

    return;

  }


  try {

    loading.classList.remove("hidden");

    empty.classList.add("hidden");

    container.classList.add("hidden");


    const response =
      await apiRequest(
        "/drives"
      );


    const drives =
      Array.isArray(
        response.drives
      )
        ? response.drives
        : [];


    container.innerHTML = "";


    if (drives.length === 0) {

      loading.classList.add("hidden");

      empty.classList.remove("hidden");

      return;

    }


    drives.forEach(
      drive => {

        const card =
          document.createElement("div");


        card.className =
          "premium-card rounded-2xl p-6";


        const roles =
          Array.isArray(drive.roles)
            ? drive.roles
            : [];


        const status =
          drive.status ||
          "UPCOMING";


        const statusStyles = {

          OPEN:
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

          UPCOMING:
            "bg-blue-500/10 text-blue-400 border-blue-500/20",

          CLOSED:
            "bg-red-500/10 text-red-400 border-red-500/20",

          COMPLETED:
            "bg-purple-500/10 text-purple-400 border-purple-500/20"

        };


        const statusClass =
          statusStyles[status] ||
          "bg-slate-500/10 text-slate-400 border-slate-500/20";


        const deadline =
          formatDriveDate(
            drive.applicationDeadline
          );


        const driveDate =
          formatDriveDate(
            drive.driveDate
          );


        card.innerHTML = `

          <div
            class="flex
                   flex-col
                   xl:flex-row
                   xl:items-start
                   xl:justify-between
                   gap-6">


            <div class="flex-1">

              <div
                class="flex
                       flex-wrap
                       items-center
                       gap-2
                       mb-3">

                <span
                  class="px-3
                         py-1
                         rounded-full
                         border
                         ${statusClass}
                         text-xs
                         font-semibold">

                  ${escapeHtml(status)}

                </span>


                <span
                  class="px-3
                         py-1
                         rounded-full
                         bg-blue-500/10
                         text-blue-300
                         text-xs">

                  ${roles.length}
                  ${roles.length === 1 ? "Role" : "Roles"}

                </span>

              </div>


              <h3
                class="text-xl
                       font-bold">

                ${escapeHtml(
                  drive.companyName
                )}

              </h3>


              <p
                class="text-blue-300
                       font-medium
                       mt-1">

                ${escapeHtml(
                  drive.driveTitle
                )}

              </p>


              <p
                class="text-sm
                       text-slate-400
                       mt-3
                       leading-relaxed">

                ${escapeHtml(
                  drive.description ||
                  "No description provided."
                )}

              </p>


              <div
                class="grid
                       grid-cols-1
                       sm:grid-cols-2
                       gap-3
                       mt-5">


                <div
                  class="rounded-xl
                         bg-slate-800/60
                         p-4">

                  <p
                    class="text-xs
                           text-slate-500">

                    Application Deadline

                  </p>

                  <p
                    class="text-sm
                           font-semibold
                           mt-1">

                    ${deadline}

                  </p>

                </div>


                <div
                  class="rounded-xl
                         bg-slate-800/60
                         p-4">

                  <p
                    class="text-xs
                           text-slate-500">

                    Drive Date

                  </p>

                  <p
                    class="text-sm
                           font-semibold
                           mt-1">

                    ${driveDate}

                  </p>

                </div>

              </div>


              <div class="mt-5">

                <p
                  class="text-xs
                         text-slate-500
                         mb-2">

                  Roles

                </p>


                <div
                  class="flex
                         flex-wrap
                         gap-2">

                  ${
                    roles
                      .map(
                        role => `

                          <span
                            class="px-3
                                   py-1.5
                                   rounded-lg
                                   bg-violet-500/10
                                   text-violet-300
                                   text-xs
                                   border
                                   border-violet-500/10">

                            ${escapeHtml(
                              role.title
                            )}

                          </span>

                        `
                      )
                      .join("")
                  }

                </div>

              </div>

            </div>


            <div
              class="flex
                     flex-wrap
                     xl:flex-col
                     gap-2
                     xl:w-32">

              <button
                type="button"
                class="view-drive-button
                       rounded-xl
                       border
                       border-slate-700
                       px-4
                       py-2.5
                       text-sm
                       font-semibold
                       hover:bg-slate-800
                       transition"
                data-drive-id="${drive._id}">

                View

              </button>


              <button
                type="button"
                class="edit-drive-button
                       rounded-xl
                       bg-blue-600
                       hover:bg-blue-700
                       px-4
                       py-2.5
                       text-sm
                       font-semibold
                       transition"
                data-drive-id="${drive._id}">

                Edit

              </button>


              <button
                type="button"
                class="delete-drive-button
                       rounded-xl
                       border
                       border-red-500/20
                       bg-red-500/5
                       text-red-300
                       hover:bg-red-500/10
                       px-4
                       py-2.5
                       text-sm
                       font-semibold
                       transition"
                data-drive-id="${drive._id}">

                Delete

              </button>

            </div>

          </div>

        `;


        container.appendChild(card);

      }
    );


    loading.classList.add("hidden");

    container.classList.remove("hidden");


  } catch (error) {

    loading.classList.add("hidden");

    showDriveMessage(
      error.message ||
      "Failed to load recruitment drives.",
      "error"
    );

  }

};


// ============================================================
// FORMAT DRIVE DATE
// ============================================================

const formatDriveDate = (
  date
) => {

  if (!date) {
    return "Not specified";
  }


  const parsed =
    new Date(date);


  if (Number.isNaN(
    parsed.getTime()
  )) {

    return "Invalid date";

  }


  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

};


// ============================================================
// OPEN DRIVE MODAL
// ============================================================

const openDriveModal = (
  mode = "create",
  drive = null
) => {

  const modal =
    document.getElementById(
      "driveModal"
    );


  if (!modal) {
    return;
  }


  const title =
    document.getElementById(
      "driveModalTitle"
    );


  const form =
    document.getElementById(
      "driveForm"
    );


  const submitButton =
    document.getElementById(
      "saveDriveButton"
    );


  const driveIdInput =
    document.getElementById(
      "driveId"
    );


  if (mode === "edit" && drive) {

    selectedDriveId =
      drive._id;


    if (title) {

      title.textContent =
        "Edit Recruitment Drive";

    }


    if (submitButton) {

      submitButton.textContent =
        "Update Drive";

    }


    if (driveIdInput) {

      driveIdInput.value =
        drive._id;

    }


    setDriveFormValue(
      "companyName",
      drive.companyName
    );


    setDriveFormValue(
      "driveTitle",
      drive.driveTitle
    );


    setDriveFormValue(
      "description",
      drive.description
    );


    setDriveFormValue(
      "applicationDeadline",
      toDateTimeLocal(
        drive.applicationDeadline
      )
    );


    setDriveFormValue(
      "driveDate",
      toDateTimeLocal(
        drive.driveDate
      )
    );


    setDriveFormValue(
      "driveStatus",
      drive.status ||
      "UPCOMING"
    );


    renderRoleInputs(
      drive.roles || []
    );


  } else {

    selectedDriveId =
      null;


    if (title) {

      title.textContent =
        "Create Recruitment Drive";

    }


    if (submitButton) {

      submitButton.textContent =
        "Create Drive";

    }


    if (driveIdInput) {

      driveIdInput.value =
        "";

    }


    if (form) {

      form.reset();

    }


    renderRoleInputs([
      {
        title: "",
        requiredSkills: [],
        preferredSkills: [],
        minimumCGPA: "",
        eligibleDegrees: []
      }
    ]);

  }


  modal.classList.remove("hidden");

};


// ============================================================
// CLOSE DRIVE MODAL
// ============================================================

const closeDriveModal = () => {

  const modal =
    document.getElementById(
      "driveModal"
    );


  if (modal) {

    modal.classList.add("hidden");

  }


  selectedDriveId =
    null;

};


// ============================================================
// SET FORM VALUE
// ============================================================

const setDriveFormValue = (
  id,
  value
) => {

  const element =
    document.getElementById(id);


  if (element) {

    element.value =
      value ?? "";

  }

};


// ============================================================
// DATE -> DATETIME LOCAL
// ============================================================

const toDateTimeLocal = (
  value
) => {

  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (Number.isNaN(
    date.getTime()
  )) {

    return "";

  }


  const pad =
    number =>
      String(number)
        .padStart(2, "0");


  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );

};


// ============================================================
// RENDER ROLE INPUTS
// ============================================================

const renderRoleInputs = (
  roles = []
) => {

  const container =
    document.getElementById(
      "rolesContainer"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  roles.forEach(
    (role, index) => {

      addRoleInput(
        role,
        index
      );

    }
  );

};


// ============================================================
// ADD ROLE INPUT
// ============================================================

const addRoleInput = (
  role = {},
  index = null
) => {

  const container =
    document.getElementById(
      "rolesContainer"
    );


  if (!container) {
    return;
  }


  const roleIndex =
    index !== null
      ? index
      : container.children.length;


  const requiredSkills =
    Array.isArray(
      role.requiredSkills
    )
      ? role.requiredSkills.join(", ")
      : "";


  const preferredSkills =
    Array.isArray(
      role.preferredSkills
    )
      ? role.preferredSkills.join(", ")
      : "";


  const eligibleDegrees =
    Array.isArray(
      role.eligibleDegrees
    )
      ? role.eligibleDegrees.join(", ")
      : "";


  const wrapper =
    document.createElement("div");


  wrapper.className =
    "role-input-card rounded-2xl " +
    "border border-slate-700/70 " +
    "bg-slate-900/70 " +
    "p-5";


  wrapper.innerHTML = `

    <div
      class="flex
             items-center
             justify-between
             gap-3
             mb-4">

      <div>

        <p
          class="text-sm
                 font-bold
                 text-white">

          Role ${roleIndex + 1}

        </p>

        <p
          class="text-xs
                 text-slate-500
                 mt-1">

          Define eligibility and skill requirements.

        </p>

      </div>


      <button
        type="button"
        class="remove-role-button
               rounded-lg
               border
               border-red-500/20
               px-3
               py-1.5
               text-xs
               text-red-300
               hover:bg-red-500/10
               transition">

        Remove

      </button>

    </div>


    <div
      class="grid
             grid-cols-1
             md:grid-cols-2
             gap-4">


      <div>

        <label
          class="block
                 text-xs
                 text-slate-400
                 mb-2">

          Role Title

        </label>

        <input
          type="text"
          class="role-title
                 w-full
                 rounded-xl
                 border
                 border-slate-700
                 bg-slate-950
                 px-4
                 py-3
                 text-sm
                 text-white
                 outline-none
                 focus:border-blue-500"
          placeholder="e.g. Cloud Engineer"
          value="${escapeHtml(
            role.title || ""
          )}">

      </div>


      <div>

        <label
          class="block
                 text-xs
                 text-slate-400
                 mb-2">

          Minimum CGPA

        </label>

        <input
          type="number"
          min="0"
          max="10"
          step="0.01"
          class="role-cgpa
                 w-full
                 rounded-xl
                 border
                 border-slate-700
                 bg-slate-950
                 px-4
                 py-3
                 text-sm
                 text-white
                 outline-none
                 focus:border-blue-500"
          placeholder="e.g. 7.0"
          value="${escapeHtml(
            role.minimumCGPA ?? ""
          )}">

      </div>


      <div class="md:col-span-2">

        <label
          class="block
                 text-xs
                 text-slate-400
                 mb-2">

          Required Skills

        </label>

        <input
          type="text"
          class="role-required-skills
                 w-full
                 rounded-xl
                 border
                 border-slate-700
                 bg-slate-950
                 px-4
                 py-3
                 text-sm
                 text-white
                 outline-none
                 focus:border-blue-500"
          placeholder="AWS, Linux, Docker"
          value="${escapeHtml(
            requiredSkills
          )}">

        <p
          class="text-[11px]
                 text-slate-600
                 mt-1">

          Separate skills with commas.

        </p>

      </div>


      <div class="md:col-span-2">

        <label
          class="block
                 text-xs
                 text-slate-400
                 mb-2">

          Preferred Skills

        </label>

        <input
          type="text"
          class="role-preferred-skills
                 w-full
                 rounded-xl
                 border
                 border-slate-700
                 bg-slate-950
                 px-4
                 py-3
                 text-sm
                 text-white
                 outline-none
                 focus:border-blue-500"
          placeholder="Kubernetes, Terraform"
          value="${escapeHtml(
            preferredSkills
          )}">

      </div>


      <div class="md:col-span-2">

        <label
          class="block
                 text-xs
                 text-slate-400
                 mb-2">

          Eligible Degrees

        </label>

        <input
          type="text"
          class="role-degrees
                 w-full
                 rounded-xl
                 border
                 border-slate-700
                 bg-slate-950
                 px-4
                 py-3
                 text-sm
                 text-white
                 outline-none
                 focus:border-blue-500"
          placeholder="B.Tech CSE, B.Tech IT"
          value="${escapeHtml(
            eligibleDegrees
          )}">

      </div>

    </div>

  `;


  const removeButton =
    wrapper.querySelector(
      ".remove-role-button"
    );


  removeButton.addEventListener(
    "click",
    () => {

      const allRoles =
        container.querySelectorAll(
          ".role-input-card"
        );


      if (allRoles.length <= 1) {

        showDriveMessage(
          "At least one role is required.",
          "error"
        );

        return;

      }


      wrapper.remove();

      renumberRoles();

    }
  );


  container.appendChild(
    wrapper
  );

};


// ============================================================
// RENUMBER ROLES
// ============================================================

const renumberRoles = () => {

  const roles =
    document.querySelectorAll(
      ".role-input-card"
    );


  roles.forEach(
    (roleCard, index) => {

      const title =
        roleCard.querySelector(
          "p.font-bold"
        );


      if (title) {

        title.textContent =
          `Role ${index + 1}`;

      }

    }
  );

};


// ============================================================
// COLLECT ROLES
// ============================================================

const collectRoles = () => {

  const roleCards =
    document.querySelectorAll(
      ".role-input-card"
    );


  const roles = [];


  roleCards.forEach(
    card => {

      const title =
        card.querySelector(
          ".role-title"
        ).value.trim();


      const requiredSkills =
        splitCommaValues(
          card.querySelector(
            ".role-required-skills"
          ).value
        );


      const preferredSkills =
        splitCommaValues(
          card.querySelector(
            ".role-preferred-skills"
          ).value
        );


      const eligibleDegrees =
        splitCommaValues(
          card.querySelector(
            ".role-degrees"
          ).value
        );


      const cgpaValue =
        card.querySelector(
          ".role-cgpa"
        ).value;


      const minimumCGPA =
        cgpaValue === ""
          ? undefined
          : Number(cgpaValue);


      roles.push({

        title,

        requiredSkills,

        preferredSkills,

        eligibleDegrees,

        minimumCGPA

      });

    }
  );


  return roles;

};


// ============================================================
// SPLIT COMMA VALUES
// ============================================================

const splitCommaValues = (
  value
) => {

  return String(value || "")
    .split(",")
    .map(
      item =>
        item.trim()
    )
    .filter(Boolean);

};


// ============================================================
// VALIDATE DRIVE FORM
// ============================================================

const validateDriveForm = (
  data
) => {

  if (
    !data.companyName ||
    data.companyName.length < 2
  ) {

    return "Enter a valid company name.";

  }


  if (
    !data.driveTitle ||
    data.driveTitle.length < 2
  ) {

    return "Enter a valid drive title.";

  }


  if (
    !data.applicationDeadline
  ) {

    return "Application deadline is required.";

  }


  const deadline =
    new Date(
      data.applicationDeadline
    );


  if (
    Number.isNaN(
      deadline.getTime()
    )
  ) {

    return "Enter a valid application deadline.";

  }


  if (
    deadline <= new Date()
  ) {

    return "Application deadline must be in the future.";

  }


  if (
    !Array.isArray(data.roles) ||
    data.roles.length === 0
  ) {

    return "At least one role is required.";

  }


  for (
    let index = 0;
    index < data.roles.length;
    index++
  ) {

    const role =
      data.roles[index];


    if (!role.title) {

      return `Enter a title for Role ${index + 1}.`;

    }


    if (
      role.minimumCGPA !== undefined &&
      (
        Number.isNaN(
          role.minimumCGPA
        ) ||
        role.minimumCGPA < 0 ||
        role.minimumCGPA > 10
      )
    ) {

      return `Minimum CGPA for Role ${index + 1} must be between 0 and 10.`;

    }

  }


  return null;

};


// ============================================================
// COLLECT DRIVE FORM
// ============================================================

const collectDriveForm = () => {

  const companyName =
    document.getElementById(
      "companyName"
    )?.value.trim() ||
    "";


  const driveTitle =
    document.getElementById(
      "driveTitle"
    )?.value.trim() ||
    "";


  const description =
    document.getElementById(
      "description"
    )?.value.trim() ||
    "";


  const applicationDeadline =
    document.getElementById(
      "applicationDeadline"
    )?.value ||
    "";


  const driveDate =
    document.getElementById(
      "driveDate"
    )?.value ||
    "";


  const status =
    document.getElementById(
      "driveStatus"
    )?.value ||
    "UPCOMING";


  const roles =
    collectRoles();


  return {

    companyName,

    driveTitle,

    description,

    roles,

    applicationDeadline,

    driveDate,

    status

  };

};


// ============================================================
// SAVE DRIVE
// ============================================================

const saveDrive = async () => {

  const data =
    collectDriveForm();


  const validationError =
    validateDriveForm(
      data
    );


  if (validationError) {

    showDriveMessage(
      validationError,
      "error"
    );

    return;

  }


  const saveButton =
    document.getElementById(
      "saveDriveButton"
    );


  try {

    if (saveButton) {

      saveButton.disabled =
        true;

      saveButton.textContent =
        selectedDriveId
          ? "Updating..."
          : "Creating...";

    }


    let response;


    if (selectedDriveId) {

      response =
        await apiRequest(
          `/drives/${selectedDriveId}`,
          {

            method: "PUT",

            body:
              JSON.stringify(data)

          }
        );

    } else {

      response =
        await apiRequest(
          "/drives",
          {

            method: "POST",

            body:
              JSON.stringify(data)

          }
        );

    }


    closeDriveModal();


    showDriveMessage(
      response.message ||
      "Recruitment drive saved successfully.",
      "success"
    );


    await loadRecruitmentDrives();


  } catch (error) {

    showDriveMessage(
      error.message ||
      "Failed to save recruitment drive.",
      "error"
    );

  } finally {

    if (saveButton) {

      saveButton.disabled =
        false;

      saveButton.textContent =
        selectedDriveId
          ? "Update Drive"
          : "Create Drive";

    }

  }

};


// ============================================================
// GET SINGLE DRIVE
// ============================================================

const getDriveById =
  async (
    driveId
  ) => {

    const response =
      await apiRequest(
        `/drives/${driveId}`
      );


    return response.drive;

  };


// ============================================================
// VIEW DRIVE
// ============================================================

const viewDrive =
  async (
    driveId
  ) => {

    try {

      const drive =
        await getDriveById(
          driveId
        );


      showDriveDetails(
        drive
      );

    } catch (error) {

      showDriveMessage(
        error.message ||
        "Failed to load drive.",
        "error"
      );

    }

  };


// ============================================================
// SHOW DRIVE DETAILS
// ============================================================

const showDriveDetails = (
  drive
) => {

  const modal =
    document.getElementById(
      "driveDetailsModal"
    );


  if (!modal) {

    return;

  }


  const content =
    document.getElementById(
      "driveDetailsContent"
    );


  if (!content) {

    return;

  }


  const roles =
    Array.isArray(
      drive.roles
    )
      ? drive.roles
      : [];


  content.innerHTML = `

    <div class="space-y-6">

      <div>

        <div
          class="flex
                 flex-wrap
                 items-center
                 gap-2">

          <span
            class="px-3
                   py-1
                   rounded-full
                   bg-blue-500/10
                   text-blue-300
                   text-xs">

            ${escapeHtml(
              drive.status ||
              "UPCOMING"
            )}

          </span>

        </div>


        <h2
          class="text-2xl
                 font-black
                 mt-3">

          ${escapeHtml(
            drive.companyName
          )}

        </h2>


        <p
          class="text-blue-300
                 font-medium
                 mt-1">

          ${escapeHtml(
            drive.driveTitle
          )}

        </p>


        <p
          class="text-sm
                 text-slate-400
                 leading-relaxed
                 mt-4">

          ${escapeHtml(
            drive.description ||
            "No description provided."
          )}

        </p>

      </div>


      <div
        class="grid
               grid-cols-1
               sm:grid-cols-2
               gap-3">

        <div
          class="rounded-xl
                 bg-slate-800/60
                 p-4">

          <p
            class="text-xs
                   text-slate-500">

            Application Deadline

          </p>

          <p
            class="font-semibold
                   mt-1">

            ${formatDriveDate(
              drive.applicationDeadline
            )}

          </p>

        </div>


        <div
          class="rounded-xl
                 bg-slate-800/60
                 p-4">

          <p
            class="text-xs
                   text-slate-500">

            Drive Date

          </p>

          <p
            class="font-semibold
                   mt-1">

            ${formatDriveDate(
              drive.driveDate
            )}

          </p>

        </div>

      </div>


      <div>

        <h3
          class="text-lg
                 font-bold
                 mb-3">

          Roles

        </h3>


        <div class="space-y-4">

          ${
            roles
              .map(
                role => `

                  <div
                    class="rounded-2xl
                           border
                           border-slate-700
                           bg-slate-900/70
                           p-5">

                    <h4
                      class="font-bold
                             text-lg">

                      ${escapeHtml(
                        role.title
                      )}

                    </h4>


                    <div class="mt-4">

                      <p
                        class="text-xs
                               text-slate-500
                               mb-2">

                        Required Skills

                      </p>

                      <div
                        class="flex
                               flex-wrap
                               gap-2">

                        ${
                          (
                            role.requiredSkills ||
                            []
                          )
                            .map(
                              skill => `

                                <span
                                  class="px-3
                                         py-1
                                         rounded-full
                                         bg-blue-500/10
                                         text-blue-300
                                         text-xs">

                                  ${escapeHtml(
                                    skill
                                  )}

                                </span>

                              `
                            )
                            .join("")
                        }

                      </div>

                    </div>


                    <div class="mt-4">

                      <p
                        class="text-xs
                               text-slate-500
                               mb-2">

                        Preferred Skills

                      </p>

                      <div
                        class="flex
                               flex-wrap
                               gap-2">

                        ${
                          (
                            role.preferredSkills ||
                            []
                          )
                            .map(
                              skill => `

                                <span
                                  class="px-3
                                         py-1
                                         rounded-full
                                         bg-purple-500/10
                                         text-purple-300
                                         text-xs">

                                  ${escapeHtml(
                                    skill
                                  )}

                                </span>

                              `
                            )
                            .join("")
                        }

                      </div>

                    </div>


                    <div
                      class="grid
                             grid-cols-1
                             sm:grid-cols-2
                             gap-3
                             mt-4">

                      <div
                        class="rounded-xl
                               bg-slate-800/60
                               p-3">

                        <p
                          class="text-xs
                                 text-slate-500">

                          Minimum CGPA

                        </p>

                        <p
                          class="text-sm
                                 font-semibold
                                 mt-1">

                          ${
                            role.minimumCGPA ??
                            "No minimum"
                          }

                        </p>

                      </div>


                      <div
                        class="rounded-xl
                               bg-slate-800/60
                               p-3">

                        <p
                          class="text-xs
                                 text-slate-500">

                          Eligible Degrees

                        </p>

                        <p
                          class="text-sm
                                 font-semibold
                                 mt-1">

                          ${escapeHtml(
                            (
                              role.eligibleDegrees ||
                              []
                            ).join(", ") ||
                            "All eligible degrees"
                          )}

                        </p>

                      </div>

                    </div>

                  </div>

                `
              )
              .join("")
          }

        </div>

      </div>

    </div>

  `;


  modal.classList.remove(
    "hidden"
  );

};


// ============================================================
// CLOSE DRIVE DETAILS
// ============================================================

const closeDriveDetails = () => {

  const modal =
    document.getElementById(
      "driveDetailsModal"
    );


  if (modal) {

    modal.classList.add("hidden");

  }

};


// ============================================================
// EDIT DRIVE
// ============================================================

const editDrive =
  async (
    driveId
  ) => {

    try {

      const drive =
        await getDriveById(
          driveId
        );


      openDriveModal(
        "edit",
        drive
      );

    } catch (error) {

      showDriveMessage(
        error.message ||
        "Failed to load drive for editing.",
        "error"
      );

    }

  };


// ============================================================
// DELETE DRIVE
// ============================================================

const deleteDrive =
  async (
    driveId
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this recruitment drive?"
      );


    if (!confirmed) {

      return;

    }


    try {

      const response =
        await apiRequest(
          `/drives/${driveId}`,
          {

            method: "DELETE"

          }
        );


      showDriveMessage(
        response.message ||
        "Recruitment drive deleted successfully.",
        "success"
      );


      await loadRecruitmentDrives();


    } catch (error) {

      showDriveMessage(
        error.message ||
        "Failed to delete recruitment drive.",
        "error"
      );

    }

  };


// ============================================================
// LOGOUT
// ============================================================

const logoutPlacement = () => {

  localStorage.removeItem(
    "careerReadyToken"
  );

  localStorage.removeItem(
    "careerReadyUser"
  );


  window.location.href =
    "../login.html";

};


// ============================================================
// DOM CONTENT LOADED
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // --------------------------------------------------------
    // Logout
    // --------------------------------------------------------

    const logoutButton =
      document.getElementById(
        "logoutButton"
      );


    if (logoutButton) {

      logoutButton.addEventListener(
        "click",
        logoutPlacement
      );

    }


    // --------------------------------------------------------
    // Auth Guard
    // --------------------------------------------------------

    const user =
      JSON.parse(
        localStorage.getItem(
          "careerReadyUser"
        )
      );


    const token =
      localStorage.getItem(
        "careerReadyToken"
      );


    if (
      !token ||
      !user ||
      user.role !== "PLACEMENT"
    ) {

      window.location.href =
        "../login.html";

      return;

    }


    // --------------------------------------------------------
    // Submitted profiles
    // --------------------------------------------------------

    const refreshProfilesButton =
      document.getElementById(
        "refreshProfilesButton"
      );


    if (refreshProfilesButton) {

      refreshProfilesButton.addEventListener(
        "click",
        loadSubmittedProfiles
      );

    }


    const submittedContainer =
      document.getElementById(
        "submittedProfilesContainer"
      );


    if (submittedContainer) {

      submittedContainer.addEventListener(
        "click",
        event => {

          const button =
            event.target.closest(
              ".view-profile-button"
            );


          if (!button) {
            return;
          }


          const profileId =
            button.dataset.profileId;


          if (profileId) {

            openProfileReview(
              profileId
            );

          }

        }
      );

    }


    // --------------------------------------------------------
    // Verified profiles
    // --------------------------------------------------------

    const refreshVerifiedButton =
      document.getElementById(
        "refreshVerifiedProfilesButton"
      );


    if (refreshVerifiedButton) {

      refreshVerifiedButton.addEventListener(
        "click",
        loadVerifiedProfiles
      );

    }


    const verifiedContainer =
      document.getElementById(
        "verifiedProfilesContainer"
      );


    if (verifiedContainer) {

      verifiedContainer.addEventListener(
        "click",
        event => {

          const button =
            event.target.closest(
              ".verified-view-profile"
            );


          if (!button) {
            return;
          }


          const profileId =
            button.dataset.profileId;


          if (profileId) {

            openVerifiedProfile(
              profileId
            );

          }

        }
      );

    }


    // --------------------------------------------------------
    // Profile review modal
    // --------------------------------------------------------

    const closeReviewButton =
      document.getElementById(
        "closeProfileReviewModal"
      );


    if (closeReviewButton) {

      closeReviewButton.addEventListener(
        "click",
        () => {

          document.getElementById(
            "profileReviewModal"
          ).classList.add("hidden");

        }
      );

    }


    const verifyButton =
      document.getElementById(
        "verifyProfileButton"
      );


    if (verifyButton) {

      verifyButton.addEventListener(
        "click",
        () =>
          submitProfileReview(
            "APPROVED"
          )
      );

    }


    const correctionButton =
      document.getElementById(
        "correctionProfileButton"
      );


    if (correctionButton) {

      correctionButton.addEventListener(
        "click",
        () =>
          submitProfileReview(
            "CORRECTION_REQUIRED"
          )
      );

    }


    // --------------------------------------------------------
    // Recruitment drives
    // --------------------------------------------------------

    const createDriveButton =
      document.getElementById(
        "createDriveButton"
      );


    if (createDriveButton) {

      createDriveButton.addEventListener(
        "click",
        () =>
          openDriveModal(
            "create"
          )
      );

    }


    const refreshDrivesButton =
      document.getElementById(
        "refreshDrivesButton"
      );


    if (refreshDrivesButton) {

      refreshDrivesButton.addEventListener(
        "click",
        loadRecruitmentDrives
      );

    }


    const addRoleButton =
      document.getElementById(
        "addRoleButton"
      );


    if (addRoleButton) {

      addRoleButton.addEventListener(
        "click",
        () =>
          addRoleInput()
      );

    }


    const saveDriveButton =
      document.getElementById(
        "saveDriveButton"
      );


    if (saveDriveButton) {

      saveDriveButton.addEventListener(
        "click",
        saveDrive
      );

    }


    const closeDriveButton =
      document.getElementById(
        "closeDriveModal"
      );


    if (closeDriveButton) {

      closeDriveButton.addEventListener(
        "click",
        closeDriveModal
      );

    }


    const cancelDriveButton =
      document.getElementById(
        "cancelDriveButton"
      );


    if (cancelDriveButton) {

      cancelDriveButton.addEventListener(
        "click",
        closeDriveModal
      );

    }


    const drivesContainer =
      document.getElementById(
        "drivesContainer"
      );


    if (drivesContainer) {

      drivesContainer.addEventListener(
        "click",
        event => {

          const viewButton =
            event.target.closest(
              ".view-drive-button"
            );


          if (viewButton) {

            const driveId =
              viewButton.dataset.driveId;


            if (driveId) {

              viewDrive(
                driveId
              );

            }

            return;

          }


          const editButton =
            event.target.closest(
              ".edit-drive-button"
            );


          if (editButton) {

            const driveId =
              editButton.dataset.driveId;


            if (driveId) {

              editDrive(
                driveId
              );

            }

            return;

          }


          const deleteButton =
            event.target.closest(
              ".delete-drive-button"
            );


          if (deleteButton) {

            const driveId =
              deleteButton.dataset.driveId;


            if (driveId) {

              deleteDrive(
                driveId
              );

            }

          }

        }
      );

    }


    // --------------------------------------------------------
    // Drive details modal
    // --------------------------------------------------------

    const closeDriveDetailsButton =
      document.getElementById(
        "closeDriveDetailsModal"
      );


    if (closeDriveDetailsButton) {

      closeDriveDetailsButton.addEventListener(
        "click",
        closeDriveDetails
      );

    }


    // --------------------------------------------------------
    // Initial loading
    // --------------------------------------------------------

    loadPlacementDashboard();

    loadSubmittedProfiles();

    loadVerifiedProfiles();

    loadRecruitmentDrives();

  }
);