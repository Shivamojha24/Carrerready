let students = [];
let selectedStudent = null;


// ============================================================
// AUTHENTICATION
// ============================================================

function checkAuthentication() {
    const token = localStorage.getItem("careerReadyToken");
    const userData = localStorage.getItem("careerReadyUser");

    if (!token || !userData) {
        window.location.href = "../login.html";
        return false;
    }

    try {
        const user = JSON.parse(userData);

        if (user.role !== "MENTOR") {
            window.location.href = "../login.html";
            return false;
        }
    } catch (error) {
        localStorage.removeItem("careerReadyToken");
        localStorage.removeItem("careerReadyUser");

        window.location.href = "../login.html";
        return false;
    }

    return true;
}


// ============================================================
// API HELPER
// ============================================================

async function mentorRequest(endpoint, options = {}) {
    const token = localStorage.getItem("careerReadyToken");

    const response = await fetch(
        `${window.API_BASE_URL || "http://localhost:5000/api"}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                ...(token
                    ? {
                        Authorization: `Bearer ${token}`
                    }
                    : {}),

                ...(options.headers || {})
            }
        }
    );

    let data;

    try {
        data = await response.json();
    } catch (error) {
        data = {
            success: false,
            message: "Invalid server response"
        };
    }

    if (!response.ok) {
        throw new Error(
            data.message || "Request failed"
        );
    }

    return data;
}


// ============================================================
// LOAD STUDENTS
// ============================================================

async function loadStudents() {
    showLoading();

    try {
        const data =
            await mentorRequest("/mentor/students");

        students =
            data.students || [];

        updateSummary();
        renderStudents();

        hideLoading();

    } catch (error) {
        console.error(error);

        showError(
            error.message ||
            "Unable to load students"
        );
    }
}


// ============================================================
// UPDATE SUMMARY
// ============================================================

function updateSummary() {
    const total =
        students.length;

    const verified =
        students.filter(
            student =>
                student.profileStatus === "VERIFIED"
        ).length;

    const pending =
        students.filter(
            student =>
                student.profileStatus === "SUBMITTED" ||
                student.profileStatus === "INCOMPLETE"
        ).length;

    const cgpas =
        students
            .map(student => Number(student.cgpa))
            .filter(cgpa => !Number.isNaN(cgpa));

    const average =
        cgpas.length
            ? (
                cgpas.reduce(
                    (sum, cgpa) =>
                        sum + cgpa,
                    0
                ) / cgpas.length
            ).toFixed(2)
            : "—";

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
}


// ============================================================
// FILTER STUDENTS
// ============================================================

function getFilteredStudents() {
    const search =
        document.getElementById(
            "searchInput"
        ).value
            .trim()
            .toLowerCase();

    const semester =
        document.getElementById(
            "semesterFilter"
        ).value;

    return students.filter(student => {
        const matchesSearch =
            !search ||

            student.name
                .toLowerCase()
                .includes(search) ||

            student.email
                .toLowerCase()
                .includes(search) ||

            (student.degree || "")
                .toLowerCase()
                .includes(search);

        const matchesSemester =
            semester === "ALL" ||

            String(student.currentSemester) ===
            semester;

        return (
            matchesSearch &&
            matchesSemester
        );
    });
}


// ============================================================
// RENDER STUDENTS
// ============================================================

function renderStudents() {
    const tbody =
        document.getElementById(
            "studentTableBody"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const filteredStudents =
        getFilteredStudents();

    tbody.innerHTML = "";

    if (!filteredStudents.length) {
        emptyState.classList.remove(
            "hidden"
        );

        return;
    }

    emptyState.classList.add(
        "hidden"
    );

    filteredStudents.forEach(student => {
        const row =
            document.createElement("tr");

        row.className =
            "table-row";

        const academicYear =
            student.academicYear || 1;

        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full
                               bg-blue-500/10
                               border border-blue-500/20
                               flex items-center justify-center
                               text-blue-400 font-semibold">

                        ${getInitials(student.name)}

                    </div>

                    <div>
                        <p class="text-sm font-semibold text-white">
                            ${escapeHtml(student.name)}
                        </p>

                        <p class="text-xs text-gray-500 mt-0.5">
                            ${escapeHtml(student.email)}
                        </p>
                    </div>
                </div>
            </td>

            <td class="px-6 py-4">
                <p class="text-sm text-gray-300">
                    ${escapeHtml(student.degree || "—")}
                </p>

                <p class="text-xs text-gray-500 mt-1">
                    ${escapeHtml(student.specialization || "")}
                </p>
            </td>

            <td class="px-6 py-4">
                <div class="flex flex-col gap-2">

                    <div class="flex items-center gap-2">

                        <span class="semester-badge">
                            Sem ${student.currentSemester}
                        </span>

                        <span class="text-xs text-gray-500">
                            Year ${academicYear}
                        </span>

                    </div>

                    <p class="text-xs text-gray-500">
                        ${student.programDuration || "—"} year program
                    </p>

                </div>
            </td>

            <td class="px-6 py-4">
                <span class="text-sm font-semibold text-white">
                    ${
                        student.cgpa !== null &&
                        student.cgpa !== undefined
                            ? Number(student.cgpa).toFixed(2)
                            : "—"
                    }
                </span>
            </td>

            <td class="px-6 py-4">
                ${getStatusBadge(
                    student.profileStatus
                )}
            </td>

            <td class="px-6 py-4 text-right">
                <button
                    class="view-student-btn
                           px-3 py-2 rounded-lg
                           bg-gray-800 hover:bg-gray-700
                           text-gray-300 text-xs
                           font-medium"
                    data-id="${student.id}">

                    View

                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    document
        .querySelectorAll(".view-student-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openStudent(
                        button.dataset.id
                    )
            );

        });
}


// ============================================================
// OPEN STUDENT DETAILS
// ============================================================

async function openStudent(studentId) {
    try {
        const data =
            await mentorRequest(
                `/mentor/students/${studentId}`
            );

        selectedStudent =
            data.student;

        populateStudentModal(
            selectedStudent
        );

        const modal =
            document.getElementById(
                "studentModal"
            );

        modal.classList.remove(
            "hidden"
        );

        modal.classList.add(
            "flex"
        );

    } catch (error) {
        alert(
            error.message ||
            "Unable to load student"
        );
    }
}


// ============================================================
// POPULATE STUDENT MODAL
// ============================================================

function populateStudentModal(student) {
    document.getElementById(
        "modalStudentName"
    ).textContent =
        student.name;

    document.getElementById(
        "modalStudentEmail"
    ).textContent =
        student.email;

    document.getElementById(
        "modalProgram"
    ).textContent =
        student.degree || "—";

    document.getElementById(
        "modalDuration"
    ).textContent =
        student.programDuration
            ? `${student.programDuration} Years`
            : "—";

    document.getElementById(
        "modalCgpa"
    ).textContent =
        student.cgpa !== undefined &&
        student.cgpa !== null
            ? Number(student.cgpa).toFixed(2)
            : "—";

    document.getElementById(
        "modalProfileStatus"
    ).textContent =
        formatStatus(
            student.profileStatus
        );

    document.getElementById(
        "modalAcademicYear"
    ).textContent =
        `Academic Year ${student.academicYear}`;

    document.getElementById(
        "modalSemester"
    ).textContent =
        `Semester ${student.currentSemester}`;

    const progress =
        student.maximumSemester
            ? Math.round(
                (
                    student.currentSemester /
                    student.maximumSemester
                ) * 100
            )
            : 0;

    document.getElementById(
        "modalProgressBar"
    ).style.width =
        `${progress}%`;

    document.getElementById(
        "modalProgressText"
    ).textContent =
        `${progress}% complete`;

    document.getElementById(
        "modalFinalSemester"
    ).textContent =
        `Semester ${student.maximumSemester}`;

    const skillsContainer =
        document.getElementById(
            "modalSkills"
        );

    skillsContainer.innerHTML = "";

    if (
        !student.skills ||
        !student.skills.length
    ) {
        skillsContainer.innerHTML = `
            <span class="text-sm text-gray-500">
                No skills added yet.
            </span>
        `;
    } else {
        student.skills.forEach(skill => {
            const span =
                document.createElement("span");

            span.className =
                "px-3 py-1.5 rounded-lg bg-blue-500/10 " +
                "border border-blue-500/20 text-blue-300 text-xs";

            span.textContent =
                skill;

            skillsContainer.appendChild(span);
        });
    }

    const promoteButton =
        document.getElementById(
            "promoteBtn"
        );

    if (
        student.currentSemester >=
        student.maximumSemester
    ) {
        promoteButton.disabled =
            true;

        promoteButton.textContent =
            "Final Semester";

        promoteButton.classList.add(
            "opacity-50",
            "cursor-not-allowed"
        );

    } else {
        promoteButton.disabled =
            false;

        promoteButton.textContent =
            `Promote to Semester ${
                student.currentSemester + 1
            }`;

        promoteButton.classList.remove(
            "opacity-50",
            "cursor-not-allowed"
        );
    }
}


// ============================================================
// PROMOTE STUDENT
// ============================================================

async function promoteSelectedStudent() {
    if (!selectedStudent) {
        return;
    }

    const current =
        selectedStudent.currentSemester;

    const next =
        current + 1;

    const confirmed =
        confirm(
            `Promote ${selectedStudent.name} from ` +
            `Semester ${current} to Semester ${next}?`
        );

    if (!confirmed) {
        return;
    }

    const button =
        document.getElementById(
            "promoteBtn"
        );

    button.disabled =
        true;

    button.textContent =
        "Promoting...";

    try {
        const data =
            await mentorRequest(
                `/mentor/students/${selectedStudent.id}/promote`,
                {
                    method: "POST"
                }
            );

        alert(
            data.message ||
            "Student promoted successfully"
        );

        closeStudentModal();

        await loadStudents();

    } catch (error) {
        alert(
            error.message ||
            "Unable to promote student"
        );

        button.disabled =
            false;

        button.textContent =
            `Promote to Semester ${next}`;
    }
}


// ============================================================
// STATUS BADGE
// ============================================================

function getStatusBadge(status) {
    const normalized =
        status || "INCOMPLETE";

    const classes = {
        VERIFIED:
            "status-badge status-verified",

        SUBMITTED:
            "status-badge status-submitted",

        INCOMPLETE:
            "status-badge status-incomplete",

        CORRECTION_REQUIRED:
            "status-badge status-correction"
    };

    return `
        <span class="${
            classes[normalized] ||
            classes.INCOMPLETE
        }">

            ${formatStatus(normalized)}

        </span>
    `;
}


function formatStatus(status) {
    if (!status) {
        return "Incomplete";
    }

    return status
        .toLowerCase()
        .split("_")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeStudentModal() {
    const modal =
        document.getElementById(
            "studentModal"
        );

    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );

    selectedStudent =
        null;
}


// ============================================================
// LOADING / ERROR STATES
// ============================================================

function showLoading() {
    document
        .getElementById(
            "loadingState"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "dashboardContent"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "errorState"
        )
        .classList.add("hidden");
}


function hideLoading() {
    document
        .getElementById(
            "loadingState"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "dashboardContent"
        )
        .classList.remove("hidden");
}


function showError(message) {
    document
        .getElementById(
            "loadingState"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "dashboardContent"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "errorState"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "errorMessage"
        )
        .textContent =
        message;
}


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getInitials(name) {
    if (!name) {
        return "S";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word =>
            word.charAt(0)
        )
        .join("")
        .toUpperCase();
}


function escapeHtml(value) {
    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!checkAuthentication()) {
            return;
        }

        document
            .getElementById(
                "searchInput"
            )
            .addEventListener(
                "input",
                renderStudents
            );

        document
            .getElementById(
                "semesterFilter"
            )
            .addEventListener(
                "change",
                renderStudents
            );

        document
            .getElementById(
                "retryBtn"
            )
            .addEventListener(
                "click",
                loadStudents
            );

        document
            .getElementById(
                "closeModalBtn"
            )
            .addEventListener(
                "click",
                closeStudentModal
            );

        document
            .getElementById(
                "closeModalAction"
            )
            .addEventListener(
                "click",
                closeStudentModal
            );

        document
            .getElementById(
                "promoteBtn"
            )
            .addEventListener(
                "click",
                promoteSelectedStudent
            );

        document
            .getElementById(
                "logoutBtn"
            )
            .addEventListener(
                "click",
                logout
            );

        document
            .getElementById(
                "mobileLogoutBtn"
            )
            .addEventListener(
                "click",
                logout
            );

        document
            .getElementById(
                "studentModal"
            )
            .addEventListener(
                "click",
                event => {

                    if (
                        event.target.id ===
                        "studentModal"
                    ) {
                        closeStudentModal();
                    }

                }
            );

        loadStudents();
    }
);


// ============================================================
// LOGOUT
// ============================================================

function logout() {
    localStorage.removeItem("careerReadyToken");
    localStorage.removeItem("careerReadyUser");

    window.location.href =
        "../login.html";
}