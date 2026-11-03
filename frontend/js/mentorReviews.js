// ============================================================
// CareerReady
// Mentor Recommendations
// ============================================================

let students = [];

let selectedStudent = null;


// ============================================================
// AUTHENTICATION
// ============================================================

function checkAuthentication() {

    const token =
        localStorage.getItem(
            "careerReadyToken"
        );

    const userJSON =
        localStorage.getItem(
            "careerReadyUser"
        );


    if (!token || !userJSON) {

        window.location.href =
            "../login.html";

        return false;
    }


    try {

        const user =
            JSON.parse(
                userJSON
            );


        if (
            user.role !==
            "MENTOR"
        ) {

            window.location.href =
                "../login.html";

            return false;
        }


    } catch (error) {

        localStorage.removeItem(
            "careerReadyToken"
        );

        localStorage.removeItem(
            "careerReadyUser"
        );

        window.location.href =
            "../login.html";

        return false;
    }


    return true;
}



// ============================================================
// LOGOUT
// ============================================================

function logout() {

    localStorage.removeItem(
        "careerReadyToken"
    );

    localStorage.removeItem(
        "careerReadyUser"
    );


    window.location.href =
        "../login.html";
}



// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    message,
    type = "success"
) {

    const box =
        document.getElementById(
            "messageBox"
        );


    if (!box) {
        return;
    }


    box.textContent =
        message;


    box.className =
        "mb-6 rounded-xl px-5 py-4 text-sm";


    if (
        type ===
        "success"
    ) {

        box.classList.add(
            "border",
            "border-green-500/30",
            "bg-green-500/10",
            "text-green-300"
        );

    } else {

        box.classList.add(
            "border",
            "border-red-500/30",
            "bg-red-500/10",
            "text-red-300"
        );
    }


    box.classList.remove(
        "hidden"
    );
}



// ============================================================
// LOAD STUDENTS
// ============================================================

async function loadStudents() {

    const select =
        document.getElementById(
            "studentSelect"
        );


    try {

        select.innerHTML = `
            <option value="">
                Loading students...
            </option>
        `;


        const data =
            await window.apiRequest(
                "/mentor/students"
            );


        students =
            data.students ||
            [];


        renderStudentOptions();


    } catch (error) {

        console.error(
            "LOAD STUDENTS ERROR:",
            error
        );


        select.innerHTML = `
            <option value="">
                Unable to load students
            </option>
        `;


        showMessage(
            error.message ||
            "Unable to load students.",
            "error"
        );
    }
}



// ============================================================
// RENDER STUDENTS
// ============================================================

function renderStudentOptions() {

    const select =
        document.getElementById(
            "studentSelect"
        );


    select.innerHTML = `
        <option value="">
            Select a student
        </option>
    `;


    students.forEach(
        student => {

            // Support both id and _id
            const studentId =
                student.id ||
                student._id;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                studentId;


            option.textContent =
                `${student.name} — Semester ${
                    student.currentSemester || 1
                }`;


            select.appendChild(
                option
            );
        }
    );
}



// ============================================================
// SELECT STUDENT
// ============================================================

async function handleStudentSelection() {

    const select =
        document.getElementById(
            "studentSelect"
        );


    const studentId =
        select.value;


    if (!studentId) {

        selectedStudent =
            null;


        hideStudentSections();

        return;
    }


    selectedStudent =
        students.find(
            student =>
                String(
                    student.id ||
                    student._id
                ) ===
                String(studentId)
        );


    if (!selectedStudent) {

        showMessage(
            "Student information could not be found.",
            "error"
        );

        return;
    }


    showStudentInformation();


    populateTargetSemesters();


    resetRecommendationForm();


    showRecommendationSections();


    await loadExistingRecommendations();
}



// ============================================================
// SHOW STUDENT INFORMATION
// ============================================================

function showStudentInformation() {

    const student =
        selectedStudent;


    document.getElementById(
        "studentName"
    ).textContent =
        student.name ||
        "Unnamed Student";


    document.getElementById(
        "studentEmail"
    ).textContent =
        student.email ||
        "No email";


    document.getElementById(
        "studentProgram"
    ).textContent =
        student.degree ||
        "—";


    document.getElementById(
        "studentSemester"
    ).textContent =
        `Semester ${
            student.currentSemester || 1
        }`;


    document.getElementById(
        "studentYear"
    ).textContent =
        `Year ${
            student.academicYear || 1
        }`;


    document.getElementById(
        "studentCgpa"
    ).textContent =
        student.cgpa !== undefined &&
        student.cgpa !== null
            ? Number(
                student.cgpa
            ).toFixed(2)
            : "—";


    renderStudentSkills();
}



// ============================================================
// STUDENT SKILLS
// ============================================================

function renderStudentSkills() {

    const container =
        document.getElementById(
            "studentSkills"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const skills =
        Array.isArray(
            selectedStudent.skills
        )
            ? selectedStudent.skills
            : [];


    if (!skills.length) {

        const span =
            document.createElement(
                "span"
            );


        span.className =
            "text-sm text-slate-500";


        span.textContent =
            "No skills added yet.";


        container.appendChild(
            span
        );


        return;
    }


    skills.forEach(
        skill => {

            const span =
                document.createElement(
                    "span"
                );


            span.className =
                "px-3 py-1.5 rounded-lg " +
                "bg-blue-500/10 " +
                "border border-blue-500/20 " +
                "text-blue-300 text-xs";


            span.textContent =
                skill;


            container.appendChild(
                span
            );
        }
    );
}



// ============================================================
// TARGET SEMESTERS
// ============================================================

function populateTargetSemesters() {

    const select =
        document.getElementById(
            "targetSemester"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        "";


    const duration =
        Number(
            selectedStudent.programDuration ||
            4
        );


    const maximumSemester =
        duration * 2;


    const currentSemester =
        Number(
            selectedStudent.currentSemester ||
            1
        );


    for (
        let semester = 1;
        semester <= maximumSemester;
        semester++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            semester;


        option.textContent =
            `Semester ${semester}`;


        if (
            semester ===
            currentSemester
        ) {

            option.selected =
                true;
        }


        select.appendChild(
            option
        );
    }
}



// ============================================================
// SHOW SECTIONS
// ============================================================

function showRecommendationSections() {

    const studentInfo =
        document.getElementById(
            "studentInfoSection"
        );


    const recommendationSection =
        document.getElementById(
            "recommendationSection"
        );


    const recommendationsSection =
        document.getElementById(
            "recommendationsSection"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (studentInfo) {

        studentInfo.classList.remove(
            "hidden"
        );
    }


    if (recommendationSection) {

        recommendationSection.classList.remove(
            "hidden"
        );
    }


    if (recommendationsSection) {

        recommendationsSection.classList.remove(
            "hidden"
        );
    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );
    }
}



// ============================================================
// HIDE SECTIONS
// ============================================================

function hideStudentSections() {

    const studentInfo =
        document.getElementById(
            "studentInfoSection"
        );


    const recommendationSection =
        document.getElementById(
            "recommendationSection"
        );


    const recommendationsSection =
        document.getElementById(
            "recommendationsSection"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (studentInfo) {

        studentInfo.classList.add(
            "hidden"
        );
    }


    if (recommendationSection) {

        recommendationSection.classList.add(
            "hidden"
        );
    }


    if (recommendationsSection) {

        recommendationsSection.classList.add(
            "hidden"
        );
    }


    if (emptyState) {

        emptyState.classList.remove(
            "hidden"
        );
    }
}



// ============================================================
// RESET FORM
// ============================================================

function resetRecommendationForm() {

    const form =
        document.getElementById(
            "recommendationForm"
        );


    if (!form) {
        return;
    }


    form.reset();


    if (selectedStudent) {

        document.getElementById(
            "targetSemester"
        ).value =
            String(
                selectedStudent.currentSemester ||
                1
            );
    }


    document.getElementById(
        "priority"
    ).value =
        "MEDIUM";
}



// ============================================================
// CREATE RECOMMENDATION
// ============================================================

async function createRecommendation(
    event
) {

    event.preventDefault();


    if (!selectedStudent) {

        showMessage(
            "Please select a student first.",
            "error"
        );

        return;
    }


    // --------------------------------------------------------
    // STUDENT ID
    // --------------------------------------------------------

    const studentId =
        selectedStudent.id ||
        selectedStudent._id;


    // --------------------------------------------------------
    // FORM VALUES
    // --------------------------------------------------------

    const semester =
        Number(
            document.getElementById(
                "targetSemester"
            ).value
        );


    const category =
        document.getElementById(
            "category"
        ).value.trim();


    const title =
        document.getElementById(
            "title"
        ).value.trim();


    const recommendation =
        document.getElementById(
            "recommendation"
        ).value.trim();


    const skillsText =
        document.getElementById(
            "skills"
        ).value.trim();


    const suggestedProject =
        document.getElementById(
            "suggestedProject"
        ).value.trim();


    const priority =
        document.getElementById(
            "priority"
        ).value;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!studentId) {

        showMessage(
            "Student is required.",
            "error"
        );

        return;
    }


    if (!semester) {

        showMessage(
            "Semester is required.",
            "error"
        );

        return;
    }


    if (!category) {

        showMessage(
            "Category is required.",
            "error"
        );

        return;
    }


    if (!title) {

        showMessage(
            "Recommendation title is required.",
            "error"
        );

        return;
    }


    if (!recommendation) {

        showMessage(
            "Recommendation is required.",
            "error"
        );

        return;
    }


    // --------------------------------------------------------
    // SKILLS
    // --------------------------------------------------------

    const skills =
        skillsText
            ? skillsText
                .split(",")
                .map(
                    skill =>
                        skill.trim()
                )
                .filter(Boolean)
            : [];


    // --------------------------------------------------------
    // BUTTON
    // --------------------------------------------------------

    const button =
        document.getElementById(
            "saveButton"
        );


    button.disabled =
        true;


    button.textContent =
        "Saving...";


    // --------------------------------------------------------
    // PAYLOAD
    // --------------------------------------------------------

    const payload = {

        student:
            studentId,

        semester:
            semester,

        category:
            category,

        title:
            title,

        recommendation:
            recommendation,

        skills:
            skills,

        suggestedProject:
            suggestedProject,

        priority:
            priority

    };


    // --------------------------------------------------------
    // DEBUG
    // --------------------------------------------------------

    console.log(
        "MENTOR RECOMMENDATION PAYLOAD:",
        payload
    );


    try {

        const data =
            await window.apiRequest(
                "/roadmap/mentor-recommendations",
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        console.log(
            "RECOMMENDATION RESPONSE:",
            data
        );


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        showMessage(
            data.message ||
            "Recommendation saved successfully.",
            "success"
        );


        // Clear form

        document
            .getElementById(
                "recommendationForm"
            )
            .reset();


        // Restore semester

        document
            .getElementById(
                "targetSemester"
            )
            .value =
            String(
                selectedStudent.currentSemester ||
                1
            );


        // Restore priority

        document
            .getElementById(
                "priority"
            ).value =
            "MEDIUM";


        // Reload list

        await loadExistingRecommendations();


    } catch (error) {

        console.error(
            "CREATE RECOMMENDATION ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to save recommendation.",
            "error"
        );


    } finally {

        button.disabled =
            false;


        button.textContent =
            "Save Recommendation";
    }
}



// ============================================================
// LOAD EXISTING RECOMMENDATIONS
// ============================================================

async function loadExistingRecommendations() {

    if (!selectedStudent) {
        return;
    }


    const studentId =
        selectedStudent.id ||
        selectedStudent._id;


    const list =
        document.getElementById(
            "recommendationsList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `
        <div class="text-center py-8 text-slate-500">
            Loading recommendations...
        </div>
    `;


    try {

        const data =
            await window.apiRequest(
                `/roadmap/mentor-recommendations/${studentId}`
            );


        const recommendations =
            Array.isArray(
                data.recommendations
            )
                ? data.recommendations
                : [];


        renderRecommendations(
            recommendations
        );


    } catch (error) {

        console.error(
            "LOAD RECOMMENDATIONS ERROR:",
            error
        );


        list.innerHTML = `
            <div class="text-center py-8 text-red-400">
                ${escapeHtml(
                    error.message ||
                    "Unable to load recommendations."
                )}
            </div>
        `;
    }
}



// ============================================================
// RENDER RECOMMENDATIONS
// ============================================================

function renderRecommendations(
    recommendations
) {

    const list =
        document.getElementById(
            "recommendationsList"
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        "";


    const count =
        document.getElementById(
            "recommendationCount"
        );


    if (count) {

        count.textContent =
            `${recommendations.length} ${
                recommendations.length === 1
                    ? "recommendation"
                    : "recommendations"
            }`;
    }


    if (!recommendations.length) {

        list.innerHTML = `
            <div class="text-center py-10 text-slate-500">
                No recommendations have been created for this student yet.
            </div>
        `;

        return;
    }


    recommendations.forEach(
        recommendation => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "rounded-2xl border " +
                "border-slate-800 " +
                "bg-slate-900/70 " +
                "p-5";


            const semester =
                recommendation.targetSemester ||
                recommendation.semester ||
                "—";


            card.innerHTML = `

                <div class="flex items-start justify-between gap-4">

                    <div>

                        <h3
                            class="text-lg font-bold text-white"
                        >
                            ${escapeHtml(
                                recommendation.title ||
                                "Untitled recommendation"
                            )}
                        </h3>


                        <p
                            class="mt-2 text-xs text-slate-500"
                        >
                            Semester ${semester}
                            •
                            ${formatCategory(
                                recommendation.category
                            )}
                        </p>

                    </div>


                    <span
                        class="rounded-full
                               px-3 py-1
                               text-xs
                               font-semibold
                               ${getPriorityClass(
                                   recommendation.priority
                               )}"
                    >
                        ${escapeHtml(
                            recommendation.priority ||
                            "MEDIUM"
                        )}
                    </span>

                </div>


                <p
                    class="mt-4
                           text-sm
                           leading-7
                           text-slate-300"
                >
                    ${escapeHtml(
                        recommendation.recommendation ||
                        ""
                    )}
                </p>

            `;


            // ------------------------------------------------
            // Skills
            // ------------------------------------------------

            if (
                Array.isArray(
                    recommendation.skills
                ) &&
                recommendation.skills.length
            ) {

                const skillsContainer =
                    document.createElement(
                        "div"
                    );


                skillsContainer.className =
                    "flex flex-wrap gap-2 mt-4";


                recommendation.skills.forEach(
                    skill => {

                        const span =
                            document.createElement(
                                "span"
                            );


                        span.className =
                            "rounded-lg " +
                            "bg-blue-500/10 " +
                            "border " +
                            "border-blue-500/20 " +
                            "px-3 py-1.5 " +
                            "text-xs " +
                            "text-blue-300";


                        span.textContent =
                            skill;


                        skillsContainer.appendChild(
                            span
                        );
                    }
                );


                card.appendChild(
                    skillsContainer
                );
            }


            // ------------------------------------------------
            // Suggested project
            // ------------------------------------------------

            if (
                recommendation.suggestedProject
            ) {

                const project =
                    document.createElement(
                        "div"
                    );


                project.className =
                    "mt-4 rounded-xl " +
                    "border border-slate-800 " +
                    "bg-slate-950/60 " +
                    "p-4";


                project.innerHTML = `

                    <p
                        class="text-xs
                               uppercase
                               tracking-wider
                               font-semibold
                               text-slate-500"
                    >
                        Suggested Project
                    </p>


                    <p
                        class="mt-2
                               text-sm
                               text-slate-200"
                    >
                        ${escapeHtml(
                            recommendation.suggestedProject
                        )}
                    </p>

                `;


                card.appendChild(
                    project
                );
            }


            list.appendChild(
                card
            );
        }
    );
}



// ============================================================
// CATEGORY
// ============================================================

function formatCategory(
    category
) {

    if (!category) {

        return "General";
    }


    return String(
        category
    )
        .toLowerCase()
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );
}



// ============================================================
// PRIORITY CLASS
// ============================================================

function getPriorityClass(
    priority
) {

    switch (
        String(
            priority || ""
        ).toUpperCase()
    ) {

        case "HIGH":

            return (
                "bg-red-500/10 " +
                "text-red-300 " +
                "border border-red-500/20"
            );


        case "LOW":

            return (
                "bg-green-500/10 " +
                "text-green-300 " +
                "border border-green-500/20"
            );


        default:

            return (
                "bg-yellow-500/10 " +
                "text-yellow-300 " +
                "border border-yellow-500/20"
            );
    }
}



// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}



// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            !checkAuthentication()
        ) {

            return;
        }


        // Logout

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logout
            );
        }


        // Student selector

        const studentSelect =
            document.getElementById(
                "studentSelect"
            );


        if (studentSelect) {

            studentSelect.addEventListener(
                "change",
                handleStudentSelection
            );
        }


        // Recommendation form

        const form =
            document.getElementById(
                "recommendationForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                createRecommendation
            );
        }


        // Load students

        loadStudents();

    }
);