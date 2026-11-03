// CareerReady Student Profile functionality

let skills = [];
let certifications = [];
let projects = [];


// ============================================================
// Authentication
// ============================================================

const checkAuthentication = () => {

  const token =
    localStorage.getItem("careerReadyToken");

  if (!token) {

    window.location.href =
      "../login.html";

    return false;
  }

  return true;
};


const logout = () => {

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
// Messages
// ============================================================

const showMessage = (
  message,
  type = "success"
) => {

  const messageBox =
    document.getElementById(
      "profileMessage"
    );

  if (!messageBox) {
    return;
  }

  messageBox.textContent =
    message;

  messageBox.className =
    "mb-6 rounded-xl px-5 py-4 text-sm";

  if (type === "success") {

    messageBox.classList.add(
      "border",
      "border-green-500/30",
      "bg-green-500/10",
      "text-green-300"
    );

  } else {

    messageBox.classList.add(
      "border",
      "border-red-500/30",
      "bg-red-500/10",
      "text-red-300"
    );
  }

  messageBox.classList.remove(
    "hidden"
  );
};


// ============================================================
// Skills
// ============================================================

const renderSkills = () => {

  const container =
    document.getElementById(
      "skillsContainer"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  skills.forEach(
    (skill, index) => {

      const badge =
        document.createElement(
          "div"
        );

      badge.className =
        "flex items-center gap-2 rounded-full " +
        "bg-blue-500/10 border border-blue-500/20 " +
        "px-3 py-2 text-sm text-blue-300";

      badge.innerHTML = `
        <span>${skill}</span>

        <button
          type="button"
          data-index="${index}"
          class="text-blue-300 hover:text-red-300"
          title="Remove skill">

          ×

        </button>
      `;

      container.appendChild(
        badge
      );
    }
  );

  const hiddenSkills =
    document.getElementById(
      "skills"
    );

  if (hiddenSkills) {

    hiddenSkills.value =
      JSON.stringify(skills);
  }
};


const addSkill = () => {

  const input =
    document.getElementById(
      "skillInput"
    );

  const skill =
    input.value.trim();

  if (!skill) {

    showMessage(
      "Please enter a skill.",
      "error"
    );

    return;
  }

  const exists =
    skills.some(
      (item) =>
        item.toLowerCase() ===
        skill.toLowerCase()
    );

  if (exists) {

    showMessage(
      "This skill has already been added.",
      "error"
    );

    return;
  }

  skills.push(skill);

  input.value = "";

  renderSkills();
};


const removeSkill = (
  index
) => {

  skills.splice(
    index,
    1
  );

  renderSkills();
};


// ============================================================
// Certifications
// ============================================================

const addCertification = (
  certification = {}
) => {

  const container =
    document.getElementById(
      "certificationsContainer"
    );

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "rounded-xl border border-slate-700 " +
    "bg-slate-950 p-5";

  card.innerHTML = `

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <div>

        <label
          class="block text-sm text-slate-300 mb-2">

          Certification Name

        </label>

        <input
          type="text"
          data-field="name"
          value="${certification.name || ""}"
          placeholder="e.g. OCI AI Foundations Associate"
          class="w-full rounded-xl border border-slate-700
                 bg-slate-900 px-4 py-3 text-white
                 outline-none focus:border-blue-500">

      </div>


      <div>

        <label
          class="block text-sm text-slate-300 mb-2">

          Provider

        </label>

        <input
          type="text"
          data-field="provider"
          value="${certification.provider || ""}"
          placeholder="e.g. Oracle"
          class="w-full rounded-xl border border-slate-700
                 bg-slate-900 px-4 py-3 text-white
                 outline-none focus:border-blue-500">

      </div>


      <div>

        <label
          class="block text-sm text-slate-300 mb-2">

          Credential ID

        </label>

        <input
          type="text"
          data-field="credentialId"
          value="${certification.credentialId || ""}"
          placeholder="Credential ID"
          class="w-full rounded-xl border border-slate-700
                 bg-slate-900 px-4 py-3 text-white
                 outline-none focus:border-blue-500">

      </div>


      <div>

        <label
          class="block text-sm text-slate-300 mb-2">

          Verification URL

        </label>

        <input
          type="url"
          data-field="verificationUrl"
          value="${certification.verificationUrl || ""}"
          placeholder="https://..."
          class="w-full rounded-xl border border-slate-700
                 bg-slate-900 px-4 py-3 text-white
                 outline-none focus:border-blue-500">

      </div>

    </div>


    <button
      type="button"
      class="remove-certification mt-4
             rounded-lg border border-red-500/30
             px-4 py-2 text-sm text-red-300
             hover:bg-red-500/10">

      Remove

    </button>
  `;

  container.appendChild(
    card
  );
};


// ============================================================
// Projects
// ============================================================

const addProject = (
  project = {}
) => {

  const container =
    document.getElementById(
      "projectsContainer"
    );

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "rounded-xl border border-slate-700 " +
    "bg-slate-950 p-5";

  const technologies =
    Array.isArray(
      project.technologies
    )
      ? project.technologies.join(", ")
      : "";

  card.innerHTML = `

    <div class="space-y-4">

      <div>

        <label
          class="block text-sm text-slate-300 mb-2">

          Project Title

        </label>

        <input
          type="text"
          data-field="title"
          value="${project.title || ""}"
          placeholder="e.g. CareerReady"
          class="w-full rounded-xl border border-slate-700
                 bg-slate-900 px-4 py-3 text-white
                 outline-none focus:border-blue-500">

      </div>


      <div>

        <label
          class="block text-sm text-slate-300 mb-2">

          Description

        </label>

        <textarea
          data-field="description"
          rows="3"
          placeholder="Describe your project..."
          class="w-full rounded-xl border border-slate-700
                 bg-slate-900 px-4 py-3 text-white
                 outline-none focus:border-blue-500">${project.description || ""}</textarea>

      </div>


      <div>

        <label
          class="block text-sm text-slate-300 mb-2">

          Technologies

        </label>

        <input
          type="text"
          data-field="technologies"
          value="${technologies}"
          placeholder="JavaScript, Node.js, MongoDB"
          class="w-full rounded-xl border border-slate-700
                 bg-slate-900 px-4 py-3 text-white
                 outline-none focus:border-blue-500">

      </div>


      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>

          <label
            class="block text-sm text-slate-300 mb-2">

            Project URL

          </label>

          <input
            type="url"
            data-field="projectUrl"
            value="${project.projectUrl || ""}"
            placeholder="https://..."
            class="w-full rounded-xl border border-slate-700
                   bg-slate-900 px-4 py-3 text-white
                   outline-none focus:border-blue-500">

        </div>


        <div>

          <label
            class="block text-sm text-slate-300 mb-2">

            GitHub URL

          </label>

          <input
            type="url"
            data-field="githubUrl"
            value="${project.githubUrl || ""}"
            placeholder="https://github.com/..."
            class="w-full rounded-xl border border-slate-700
                   bg-slate-900 px-4 py-3 text-white
                   outline-none focus:border-blue-500">

        </div>

      </div>

    </div>


    <button
      type="button"
      class="remove-project mt-4
             rounded-lg border border-red-500/30
             px-4 py-2 text-sm text-red-300
             hover:bg-red-500/10">

      Remove

    </button>
  `;

  container.appendChild(
    card
  );
};


// ============================================================
// Collect Form Data
// ============================================================

const collectCertifications = () => {

  const cards =
    document.querySelectorAll(
      "#certificationsContainer > div"
    );

  return Array.from(cards)
    .map(
      (card) => {

        const getValue =
          (field) => {

            const input =
              card.querySelector(
                `[data-field="${field}"]`
              );

            return input
              ? input.value.trim()
              : "";
          };


        const name =
          getValue("name");

        if (!name) {
          return null;
        }

        return {

          name,

          provider:
            getValue("provider"),

          credentialId:
            getValue("credentialId"),

          verificationUrl:
            getValue(
              "verificationUrl"
            )
        };
      }
    )
    .filter(Boolean);
};


const collectProjects = () => {

  const cards =
    document.querySelectorAll(
      "#projectsContainer > div"
    );

  return Array.from(cards)
    .map(
      (card) => {

        const getValue =
          (field) => {

            const input =
              card.querySelector(
                `[data-field="${field}"]`
              );

            return input
              ? input.value.trim()
              : "";
          };


        const title =
          getValue("title");

        if (!title) {
          return null;
        }


        const technologies =
          getValue("technologies")
            .split(",")
            .map(
              (item) =>
                item.trim()
            )
            .filter(Boolean);


        return {

          title,

          description:
            getValue(
              "description"
            ),

          technologies,

          projectUrl:
            getValue(
              "projectUrl"
            ),

          githubUrl:
            getValue(
              "githubUrl"
            )
        };
      }
    )
    .filter(Boolean);
};


const collectExperience = () => {

  return Array.from(
    document.querySelectorAll(
      'input[name="experience"]:checked'
    )
  ).map(
    (input) =>
      input.value
  );
};


// ============================================================
// Collect Complete Profile
// ============================================================

const collectProfileData = () => {

  const programDuration =
    Number(
      document.getElementById(
        "programDuration"
      ).value
    );


  const graduationYear =
    Number(
      document.getElementById(
        "graduationYear"
      ).value
    );


  const cgpa =
    Number(
      document.getElementById(
        "cgpa"
      ).value
    );


  return {

    university:
      document.getElementById(
        "university"
      ).value.trim(),


    degree:
      document.getElementById(
        "degree"
      ).value.trim(),


    specialization:
      document.getElementById(
        "specialization"
      ).value.trim(),


    programDuration,


    graduationYear,


    cgpa,


    skills:
      [...skills],


    certifications:
      collectCertifications(),


    projects:
      collectProjects(),


    experience:
      collectExperience()

  };
};


// ============================================================
// Validation
// ============================================================

const validateProfile = (
  profile
) => {

  if (!profile.university) {

    return "University is required.";
  }


  if (!profile.degree) {

    return "Degree is required.";
  }


  if (
    ![2, 3, 4].includes(
      profile.programDuration
    )
  ) {

    return "Please select a valid program duration.";
  }


  if (
    !profile.graduationYear ||
    profile.graduationYear < 2020 ||
    profile.graduationYear > 2040
  ) {

    return "Please enter a valid graduation year.";
  }


  if (
    Number.isNaN(
      profile.cgpa
    ) ||
    profile.cgpa < 0 ||
    profile.cgpa > 10
  ) {

    return "CGPA must be between 0 and 10.";
  }


  return null;
};


// ============================================================
// Save Profile
// ============================================================

const saveProfile = async () => {

  const button =
    document.getElementById(
      "saveProfileButton"
    );


  try {

    const profileData =
      collectProfileData();


    const validationError =
      validateProfile(
        profileData
      );


    if (validationError) {

      throw new Error(
        validationError
      );
    }


    button.disabled = true;

    button.textContent =
      "Saving...";


    const response =
      await window.apiRequest(
        "/student/profile",
        {
          method: "POST",

          body:
            JSON.stringify(
              profileData
            )
        }
      );


    showMessage(
      response.message ||
        "Profile saved successfully.",
      "success"
    );


    return true;


  } catch (error) {

    showMessage(
      error.message ||
        "Failed to save profile.",
      "error"
    );


    return false;


  } finally {

    button.disabled = false;

    button.textContent =
      "Save Profile";
  }
};


// ============================================================
// Submit Profile
// ============================================================

const submitProfile = async () => {

  const button =
    document.getElementById(
      "submitProfileButton"
    );


  try {

    button.disabled = true;

    button.textContent =
      "Saving & Submitting...";


    const saved =
      await saveProfile();


    if (!saved) {
      return;
    }


    const response =
      await window.apiRequest(
        "/student/profile/submit",
        {
          method: "POST"
        }
      );


    showMessage(
      response.message ||
        "Profile submitted for review.",
      "success"
    );


  } catch (error) {

    showMessage(
      error.message ||
        "Failed to submit profile.",
      "error"
    );


  } finally {

    button.disabled = false;

    button.textContent =
      "Submit for Review";
  }
};


// ============================================================
// Load Existing Profile
// ============================================================

const loadProfile = async () => {

  try {

    const response =
      await window.apiRequest(
        "/student/profile",
        {
          method: "GET"
        }
      );


    const profile =
      response.profile;


    if (!profile) {
      return;
    }


    // Academic information

    document.getElementById(
      "university"
    ).value =
      profile.university || "";


    document.getElementById(
      "degree"
    ).value =
      profile.degree || "";


    document.getElementById(
      "specialization"
    ).value =
      profile.specialization || "";


    document.getElementById(
      "programDuration"
    ).value =
      profile.programDuration || "";


    document.getElementById(
      "graduationYear"
    ).value =
      profile.graduationYear || "";


    document.getElementById(
      "cgpa"
    ).value =
      profile.cgpa ?? "";


    // Skills

    skills =
      Array.isArray(
        profile.skills
      )
        ? [...profile.skills]
        : [];


    renderSkills();


    // Certifications

    certifications =
      Array.isArray(
        profile.certifications
      )
        ? profile.certifications
        : [];


    const certificationContainer =
      document.getElementById(
        "certificationsContainer"
      );


    certificationContainer.innerHTML =
      "";


    certifications.forEach(
      (certification) => {

        addCertification(
          certification
        );
      }
    );


    // Projects

    projects =
      Array.isArray(
        profile.projects
      )
        ? profile.projects
        : [];


    const projectContainer =
      document.getElementById(
        "projectsContainer"
      );


    projectContainer.innerHTML =
      "";


    projects.forEach(
      (project) => {

        addProject(
          project
        );
      }
    );


    // Experience

    const experience =
      Array.isArray(
        profile.experience
      )
        ? profile.experience
        : [];


    document
      .querySelectorAll(
        'input[name="experience"]'
      )
      .forEach(
        (checkbox) => {

          const checkboxValue =
            checkbox.value;


          const isSelected =
            experience.some(
              (item) => {

                if (
                  item &&
                  typeof item ===
                    "object"
                ) {

                  return (
                    item.type ===
                    checkboxValue
                  );
                }


                return (
                  item ===
                  checkboxValue
                );
              }
            );


          checkbox.checked =
            isSelected;
        }
      );


    showMessage(
      "Existing profile loaded.",
      "success"
    );


  } catch (error) {

    if (
      error.message ===
      "Student profile not found"
    ) {

      return;
    }


    showMessage(
      error.message ||
        "Failed to load profile.",
      "error"
    );
  }
};


// ============================================================
// Event Listeners
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    // Authentication

    if (!checkAuthentication()) {
      return;
    }


    // Add skill

    document
      .getElementById(
        "addSkillButton"
      )
      .addEventListener(
        "click",
        addSkill
      );


    // Add skill with Enter

    document
      .getElementById(
        "skillInput"
      )
      .addEventListener(
        "keydown",
        (event) => {

          if (
            event.key ===
            "Enter"
          ) {

            event.preventDefault();

            addSkill();
          }
        }
      );


    // Remove skill

    document
      .getElementById(
        "skillsContainer"
      )
      .addEventListener(
        "click",
        (event) => {

          const button =
            event.target.closest(
              "button[data-index]"
            );


          if (!button) {
            return;
          }


          removeSkill(
            Number(
              button.dataset.index
            )
          );
        }
      );


    // Add certification

    document
      .getElementById(
        "addCertificationButton"
      )
      .addEventListener(
        "click",
        () =>
          addCertification()
      );


    // Remove certification

    document
      .getElementById(
        "certificationsContainer"
      )
      .addEventListener(
        "click",
        (event) => {

          if (
            event.target.classList.contains(
              "remove-certification"
            )
          ) {

            event.target
              .closest(
                "div.rounded-xl"
              )
              .remove();
          }
        }
      );


    // Add project

    document
      .getElementById(
        "addProjectButton"
      )
      .addEventListener(
        "click",
        () =>
          addProject()
      );


    // Remove project

    document
      .getElementById(
        "projectsContainer"
      )
      .addEventListener(
        "click",
        (event) => {

          if (
            event.target.classList.contains(
              "remove-project"
            )
          ) {

            event.target
              .closest(
                "div.rounded-xl"
              )
              .remove();
          }
        }
      );


    // Save profile

    document
      .getElementById(
        "saveProfileButton"
      )
      .addEventListener(
        "click",
        saveProfile
      );


    // Submit profile

    document
      .getElementById(
        "submitProfileButton"
      )
      .addEventListener(
        "click",
        submitProfile
      );


    // Logout

    document
      .getElementById(
        "logoutButton"
      )
      .addEventListener(
        "click",
        logout
      );


    // Load existing profile

    await loadProfile();

  }
);