// ============================================================
// CareerReady - Placement Students
// ============================================================

let allStudents = [];


// ============================================================
// HTML ESCAPE
// ============================================================

const escapeHtml = (value) => {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

};


// ============================================================
// AUTH CHECK
// ============================================================

const checkPlacementUser = () => {

  const user = JSON.parse(
    localStorage.getItem("careerReadyUser")
  );

  const token = localStorage.getItem(
    "careerReadyToken"
  );

  if (
    !user ||
    !token ||
    user.role !== "PLACEMENT"
  ) {

    window.location.href = "../login.html";

    return false;

  }

  return true;

};


// ============================================================
// LOAD STUDENTS
// ============================================================

const loadStudents = async () => {

  const loadingState =
    document.getElementById("loadingState");

  const emptyState =
    document.getElementById("emptyState");

  const container =
    document.getElementById("studentsContainer");

  const errorMessage =
    document.getElementById("errorMessage");


  loadingState.classList.remove("hidden");
  emptyState.classList.add("hidden");
  container.classList.add("hidden");
  errorMessage.classList.add("hidden");


  try {

    /*
      Existing Placement APIs:

      /placement/profiles
      = submitted profiles

      /placement/profiles/verified
      = verified profiles
    */

    const [
      submittedResponse,
      verifiedResponse
    ] = await Promise.all([

      apiRequest(
        "/placement/profiles"
      ),

      apiRequest(
        "/placement/profiles/verified"
      )

    ]);


    const submitted =
      Array.isArray(submittedResponse.profiles)
        ? submittedResponse.profiles
        : [];


    const verified =
      Array.isArray(verifiedResponse.profiles)
        ? verifiedResponse.profiles
        : [];


    /*
      Combine both lists.

      A profile should appear only once.
    */

    const profileMap = new Map();


    submitted.forEach((profile) => {

      profileMap.set(
        profile._id,
        profile
      );

    });


    verified.forEach((profile) => {

      profileMap.set(
        profile._id,
        profile
      );

    });


    allStudents =
      Array.from(profileMap.values());


    updateStatistics();

    applyFilters();


  } catch (error) {

    console.error(
      "LOAD STUDENTS ERROR:",
      error
    );

    errorMessage.textContent =
      error.message ||
      "Failed to load students.";

    errorMessage.classList.remove(
      "hidden"
    );

  } finally {

    loadingState.classList.add(
      "hidden"
    );

  }

};


// ============================================================
// UPDATE STATISTICS
// ============================================================

const updateStatistics = () => {

  const total =
    allStudents.length;


  const verified =
    allStudents.filter(
      student =>
        student.profileStatus === "VERIFIED"
    ).length;


  const pending =
    allStudents.filter(
      student =>
        student.profileStatus === "SUBMITTED"
    ).length;


  const cgpas =
    allStudents
      .map(student => Number(student.cgpa))
      .filter(
        cgpa =>
          Number.isFinite(cgpa)
      );


  const average =
    cgpas.length
      ? (
          cgpas.reduce(
            (sum, cgpa) =>
              sum + cgpa,
            0
          ) / cgpas.length
        ).toFixed(2)
      : "--";


  document.getElementById(
    "totalStudents"
  ).textContent = total;


  document.getElementById(
    "verifiedStudents"
  ).textContent = verified;


  document.getElementById(
    "pendingStudents"
  ).textContent = pending;


  document.getElementById(
    "averageCgpa"
  ).textContent = average;

};


// ============================================================
// APPLY FILTERS
// ============================================================

const applyFilters = () => {

  const search =
    document.getElementById(
      "searchInput"
    ).value
      .trim()
      .toLowerCase();


  const status =
    document.getElementById(
      "statusFilter"
    ).value;


  const filtered =
    allStudents.filter(
      (student) => {

        const user =
          student.user || {};


        const searchableText = [

          user.name,

          user.email,

          student.university,

          student.degree,

          student.specialization

        ]
          .join(" ")
          .toLowerCase();


        const matchesSearch =
          !search ||
          searchableText.includes(
            search
          );


        const matchesStatus =
          status === "ALL" ||
          student.profileStatus === status;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );


  renderStudents(filtered);

};


// ============================================================
// STATUS BADGE
// ============================================================

const getStatusBadge = (
  status
) => {

  if (
    status === "VERIFIED"
  ) {

    return `
      <span class="status-badge verified">
        VERIFIED
      </span>
    `;

  }


  if (
    status === "SUBMITTED"
  ) {

    return `
      <span class="status-badge submitted">
        PENDING VERIFICATION
      </span>
    `;

  }


  if (
    status === "CORRECTION_REQUIRED"
  ) {

    return `
      <span class="status-badge correction">
        CORRECTION REQUIRED
      </span>
    `;

  }


  return `
    <span class="status-badge incomplete">
      ${escapeHtml(status || "INCOMPLETE")}
    </span>
  `;

};


// ============================================================
// RENDER STUDENTS
// ============================================================

const renderStudents = (
  students
) => {

  const container =
    document.getElementById(
      "studentsContainer"
    );


  const emptyState =
    document.getElementById(
      "emptyState"
    );


  container.innerHTML = "";


  if (!students.length) {

    container.classList.add(
      "hidden"
    );

    emptyState.classList.remove(
      "hidden"
    );

    return;

  }


  emptyState.classList.add(
    "hidden"
  );


  students.forEach(
    (student) => {

      const user =
        student.user || {};


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "student-card bg-white border border-slate-200 rounded-2xl p-6";


      const skills =
        Array.isArray(student.skills)
          ? student.skills
          : [];


      const skillsHtml =
        skills.length

          ? skills
              .slice(0, 6)
              .map(
                skill => `
                  <span class="
                    px-2.5
                    py-1
                    rounded-full
                    bg-blue-50
                    text-blue-700
                    text-xs
                    font-medium
                  ">
                    ${escapeHtml(skill)}
                  </span>
                `
              )
              .join("")

          : `
              <span class="text-sm text-slate-400">
                No skills added
              </span>
            `;


      card.innerHTML = `

        <div class="flex items-start justify-between gap-4">

          <div class="flex items-center gap-4">

            <div class="
              w-12
              h-12
              rounded-xl
              bg-blue-100
              text-blue-700
              flex
              items-center
              justify-center
              font-bold
              text-lg
            ">
              ${escapeHtml(
                (user.name || "S")
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>


            <div>

              <h3 class="text-lg font-bold text-slate-900">
                ${escapeHtml(
                  user.name || "Student"
                )}
              </h3>

              <p class="text-sm text-slate-500 mt-1">
                ${escapeHtml(
                  user.email || "--"
                )}
              </p>

            </div>

          </div>


          ${getStatusBadge(
            student.profileStatus
          )}

        </div>


        <div class="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
          mt-6
          pt-5
          border-t
          border-slate-100
        ">

          <div>

            <p class="text-xs text-slate-400">
              Degree
            </p>

            <p class="text-sm font-semibold mt-1">
              ${escapeHtml(
                student.degree || "--"
              )}
            </p>

          </div>


          <div>

            <p class="text-xs text-slate-400">
              Specialization
            </p>

            <p class="text-sm font-semibold mt-1">
              ${escapeHtml(
                student.specialization || "--"
              )}
            </p>

          </div>


          <div>

            <p class="text-xs text-slate-400">
              CGPA
            </p>

            <p class="text-sm font-semibold mt-1">
              ${
                student.cgpa !== null &&
                student.cgpa !== undefined
                  ? escapeHtml(student.cgpa)
                  : "--"
              }
            </p>

          </div>


          <div>

            <p class="text-xs text-slate-400">
              Graduation
            </p>

            <p class="text-sm font-semibold mt-1">
              ${escapeHtml(
                student.graduationYear || "--"
              )}
            </p>

          </div>

        </div>


        <div class="mt-5">

          <p class="text-xs text-slate-400 mb-2">
            Skills
          </p>

          <div class="flex flex-wrap gap-2">
            ${skillsHtml}
          </div>

        </div>


        <div class="
          mt-6
          flex
          flex-col
          sm:flex-row
          gap-3
        ">

          <a
            href="./verification.html"
            class="
              flex-1
              text-center
              rounded-xl
              border
              border-slate-300
              px-4
              py-3
              text-sm
              font-semibold
              hover:bg-slate-50
            "
          >
            Verification
          </a>


          <button
            type="button"
            class="
              flex-1
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-4
              py-3
              text-sm
              font-semibold
            "
            onclick="viewStudent('${student._id}')"
          >
            View Details
          </button>

        </div>

      `;


      container.appendChild(card);

    }
  );


  container.classList.remove(
    "hidden"
  );

};


// ============================================================
// VIEW STUDENT
// ============================================================

const viewStudent = (
  profileId
) => {

  /*
    Keep this simple for now.

    The detailed student page can be connected
    later without changing the Students API.
  */

  const student =
    allStudents.find(
      item =>
        item._id === profileId
    );


  if (!student) {
    return;
  }


  const user =
    student.user || {};


  alert(
    `Student: ${user.name || "Student"}\n\n` +
    `Email: ${user.email || "--"}\n` +
    `Degree: ${student.degree || "--"}\n` +
    `Specialization: ${student.specialization || "--"}\n` +
    `CGPA: ${student.cgpa ?? "--"}\n` +
    `Status: ${student.profileStatus || "--"}`
  );

};


// ============================================================
// LOGOUT
// ============================================================

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
// EVENT LISTENERS
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    if (!checkPlacementUser()) {
      return;
    }


    document
      .getElementById(
        "searchInput"
      )
      .addEventListener(
        "input",
        applyFilters
      );


    document
      .getElementById(
        "statusFilter"
      )
      .addEventListener(
        "change",
        applyFilters
      );


    document
      .getElementById(
        "refreshButton"
      )
      .addEventListener(
        "click",
        loadStudents
      );


    document
      .getElementById(
        "logoutButton"
      )
      .addEventListener(
        "click",
        logout
      );


    loadStudents();

  }
);