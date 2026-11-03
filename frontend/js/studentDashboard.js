// ============================================================
// CareerReady Student Dashboard
// Academic-stage aware dashboard
// ============================================================


// ============================================================
// FORMAT TEXT
// ============================================================

const formatText = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Not Assessed";
    }


    return String(value)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (char) => char.toUpperCase()
        );
};



// ============================================================
// ESCAPE HTML
// ============================================================

const escapeHtml = (value) => {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};



// ============================================================
// LOGOUT
// ============================================================

const logoutStudent = () => {

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
// RENDER SKILLS
// ============================================================

const renderSkills = (
    skills = []
) => {

    const container =
        document.getElementById(
            "skillsContainer"
        );


    if (!container) {
        return;
    }


    if (!skills.length) {

        container.innerHTML = `
            <span class="text-sm text-slate-500">
                No skills added yet.
            </span>
        `;

        return;
    }


    container.innerHTML =
        skills
            .map(
                (skill) => `
                    <span
                        class="
                            rounded-full
                            bg-blue-500/10
                            border
                            border-blue-500/20
                            px-3 py-1
                            text-xs
                            text-blue-300
                        "
                    >
                        ${escapeHtml(skill)}
                    </span>
                `
            )
            .join("");
};



// ============================================================
// RENDER ROADMAP LIST
// ============================================================

const renderRoadmapList = (
    elementId,
    items = []
) => {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {
        return;
    }


    if (!items.length) {

        container.innerHTML = `
            <p class="text-sm text-slate-500">
                No recommendations available.
            </p>
        `;

        return;
    }


    container.innerHTML =
        items
            .slice(0, 5)
            .map(
                (item) => `
                    <div
                        class="
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            bg-slate-900/60
                            border
                            border-slate-800
                            p-3
                        "
                    >

                        <span
                            class="
                                mt-1
                                w-2
                                h-2
                                rounded-full
                                bg-cyan-400
                                flex-shrink-0
                            "
                        ></span>

                        <span
                            class="
                                text-sm
                                text-slate-300
                            "
                        >
                            ${escapeHtml(item)}
                        </span>

                    </div>
                `
            )
            .join("");
};



// ============================================================
// RENDER RECOMMENDED ROLES
// ============================================================

const renderRecommendedRoles = (
    roles = []
) => {

    const container =
        document.getElementById(
            "recommendedRoles"
        );


    if (!container) {
        return;
    }


    if (!roles.length) {

        container.innerHTML = `
            <div
                class="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900
                    p-6
                "
            >

                <p class="text-slate-400">
                    No recommended placement roles are currently available.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        roles
            .map(
                (role) => {

                    const skillMatch =
                        Number(
                            role.skillMatch || 0
                        );


                    const matchClass =
                        skillMatch >= 80
                            ? "bg-emerald-500"
                            : skillMatch >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500";


                    return `

                        <article
                            class="
                                rounded-2xl
                                border
                                border-slate-800
                                bg-slate-900
                                p-6
                            "
                        >

                            <div
                                class="
                                    flex
                                    items-start
                                    justify-between
                                    gap-4
                                "
                            >

                                <div>

                                    <p
                                        class="
                                            text-sm
                                            text-blue-400
                                            font-medium
                                        "
                                    >
                                        ${escapeHtml(
                                            role.companyName
                                        )}
                                    </p>


                                    <h4
                                        class="
                                            text-lg
                                            font-semibold
                                            mt-1
                                        "
                                    >
                                        ${escapeHtml(
                                            role.roleTitle
                                        )}
                                    </h4>


                                    <p
                                        class="
                                            text-sm
                                            text-slate-500
                                            mt-1
                                        "
                                    >
                                        ${escapeHtml(
                                            role.driveTitle
                                        )}
                                    </p>

                                </div>


                                <span
                                    class="
                                        rounded-full
                                        px-3 py-1
                                        text-xs
                                        ${
                                            role.eligible
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-red-500/10 text-red-400"
                                        }
                                    "
                                >

                                    ${
                                        role.eligible
                                            ? "Eligible"
                                            : "Not Eligible"
                                    }

                                </span>

                            </div>


                            <div class="mt-6">

                                <div
                                    class="
                                        flex
                                        justify-between
                                        text-sm
                                    "
                                >

                                    <span
                                        class="text-slate-400"
                                    >
                                        Required Skill Match
                                    </span>


                                    <span
                                        class="font-semibold"
                                    >
                                        ${skillMatch}%
                                    </span>

                                </div>


                                <div
                                    class="
                                        w-full
                                        h-2
                                        bg-slate-800
                                        rounded-full
                                        mt-2
                                    "
                                >

                                    <div
                                        class="
                                            h-full
                                            rounded-full
                                            ${matchClass}
                                        "
                                        style="
                                            width:${Math.min(
                                                skillMatch,
                                                100
                                            )}%
                                        "
                                    ></div>

                                </div>


                                ${
                                    role.missingSkills?.length
                                        ? `
                                            <div class="mt-4">

                                                <p
                                                    class="
                                                        text-xs
                                                        text-slate-500
                                                        mb-2
                                                    "
                                                >
                                                    Missing Skills
                                                </p>

                                                <div
                                                    class="
                                                        flex
                                                        flex-wrap
                                                        gap-2
                                                    "
                                                >

                                                    ${role.missingSkills
                                                        .map(
                                                            skill => `
                                                                <span
                                                                    class="
                                                                        rounded-full
                                                                        bg-red-500/10
                                                                        border
                                                                        border-red-500/20
                                                                        px-2 py-1
                                                                        text-xs
                                                                        text-red-300
                                                                    "
                                                                >
                                                                    ${escapeHtml(
                                                                        skill
                                                                    )}
                                                                </span>
                                                            `
                                                        )
                                                        .join("")}

                                                </div>

                                            </div>
                                        `
                                        : ""
                                }

                            </div>

                        </article>

                    `;
                }
            )
            .join("");
};



// ============================================================
// RENDER APPLICATIONS
// ============================================================

const renderApplications = (
    applications = []
) => {

    const container =
        document.getElementById(
            "applicationsContainer"
        );


    if (!container) {
        return;
    }


    if (!applications.length) {

        container.innerHTML = `
            <div class="p-6">

                <p class="text-slate-500">
                    No applications found.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = `

        <div class="overflow-x-auto">

            <table
                class="w-full text-left"
            >

                <thead
                    class="
                        bg-slate-950/60
                        border-b
                        border-slate-800
                    "
                >

                    <tr>

                        <th
                            class="
                                px-6 py-4
                                text-xs
                                text-slate-500
                                uppercase
                            "
                        >
                            Company
                        </th>

                        <th
                            class="
                                px-6 py-4
                                text-xs
                                text-slate-500
                                uppercase
                            "
                        >
                            Role
                        </th>

                        <th
                            class="
                                px-6 py-4
                                text-xs
                                text-slate-500
                                uppercase
                            "
                        >
                            Status
                        </th>

                        <th
                            class="
                                px-6 py-4
                                text-xs
                                text-slate-500
                                uppercase
                            "
                        >
                            Applied
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        applications
                            .map(
                                (application) => `
                                    <tr
                                        class="
                                            border-b
                                            border-slate-800
                                            last:border-0
                                        "
                                    >

                                        <td
                                            class="
                                                px-6 py-4
                                                text-sm
                                            "
                                        >
                                            ${escapeHtml(
                                                application.drive
                                                    ?.companyName ||
                                                "--"
                                            )}
                                        </td>


                                        <td
                                            class="
                                                px-6 py-4
                                                text-sm
                                            "
                                        >
                                            ${escapeHtml(
                                                application.roleTitle ||
                                                "--"
                                            )}
                                        </td>


                                        <td
                                            class="px-6 py-4"
                                        >

                                            <span
                                                class="
                                                    rounded-full
                                                    bg-blue-500/10
                                                    border
                                                    border-blue-500/20
                                                    px-3 py-1
                                                    text-xs
                                                    text-blue-300
                                                "
                                            >
                                                ${formatText(
                                                    application.status
                                                )}
                                            </span>

                                        </td>


                                        <td
                                            class="
                                                px-6 py-4
                                                text-sm
                                                text-slate-400
                                            "
                                        >
                                            ${
                                                application.appliedAt
                                                    ? new Date(
                                                        application.appliedAt
                                                    ).toLocaleDateString()
                                                    : "--"
                                            }
                                        </td>

                                    </tr>
                                `
                            )
                            .join("")
                    }

                </tbody>

            </table>

        </div>

    `;
};



// ============================================================
// RENDER PREPARATION
// ============================================================

const renderPreparationChecklist = (
    checklist = []
) => {

    const container =
        document.getElementById(
            "preparationChecklist"
        );


    if (!container) {
        return;
    }


    if (!checklist.length) {

        container.innerHTML = `
            <div
                class="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900
                    p-6
                "
            >

                <p class="text-slate-400">
                    No immediate placement preparation tasks.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        checklist
            .map(
                (item) => `

                    <div
                        class="
                            rounded-2xl
                            border
                            border-slate-800
                            bg-slate-900
                            p-5
                        "
                    >

                        <div
                            class="
                                flex
                                items-start
                                gap-4
                            "
                        >

                            <div
                                class="
                                    mt-1
                                    w-3
                                    h-3
                                    rounded-full
                                    ${
                                        item.priority === "HIGH"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                    }
                                "
                            ></div>


                            <div>

                                <h4
                                    class="font-medium"
                                >
                                    ${escapeHtml(
                                        item.task
                                    )}
                                </h4>


                                <p
                                    class="
                                        text-sm
                                        text-slate-500
                                        mt-2
                                    "
                                >
                                    ${escapeHtml(
                                        item.reason
                                    )}
                                </p>


                                <span
                                    class="
                                        inline-block
                                        mt-3
                                        rounded-full
                                        bg-slate-800
                                        px-2 py-1
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    ${escapeHtml(
                                        item.category
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                `
            )
            .join("");
};



// ============================================================
// UPDATE PLACEMENT VISIBILITY
// ============================================================

const updatePlacementVisibility = (
    placementAccess
) => {

    const placementSection =
        document.getElementById(
            "placementSection"
        );


    const earlyStageSection =
        document.getElementById(
            "earlyStageSection"
        );


    const drivesNav =
        document.getElementById(
            "placementDrivesNav"
        );


    const applicationsNav =
        document.getElementById(
            "applicationsNav"
        );


    const preparationNav =
        document.getElementById(
            "preparationNav"
        );


    const foundationMessage =
        document.getElementById(
            "foundationMessage"
        );


    const placementUnlockedMessage =
        document.getElementById(
            "placementUnlockedMessage"
        );


    const journeyLabel =
        document.getElementById(
            "journeyLabelText"
        );


    const heroDescription =
        document.getElementById(
            "heroDescription"
        );


    if (placementAccess) {

        // -----------------------------------------------
        // PLACEMENT UNLOCKED
        // -----------------------------------------------

        placementSection?.classList.remove(
            "hidden"
        );

        earlyStageSection?.classList.add(
            "hidden"
        );


        drivesNav?.classList.remove(
            "hidden"
        );

        applicationsNav?.classList.remove(
            "hidden"
        );

        preparationNav?.classList.remove(
            "hidden"
        );


        foundationMessage?.classList.add(
            "hidden"
        );

        placementUnlockedMessage?.classList.remove(
            "hidden"
        );


        if (journeyLabel) {

            journeyLabel.textContent =
                "Placement Journey Active";
        }


        if (heroDescription) {

            heroDescription.textContent =
                "Track your placement readiness, explore recruitment opportunities and prepare for your target roles.";
        }

    } else {

        // -----------------------------------------------
        // EARLY ACADEMIC STAGE
        // -----------------------------------------------

        placementSection?.classList.add(
            "hidden"
        );

        earlyStageSection?.classList.remove(
            "hidden"
        );


        drivesNav?.classList.add(
            "hidden"
        );

        applicationsNav?.classList.add(
            "hidden"
        );

        preparationNav?.classList.add(
            "hidden"
        );


        foundationMessage?.classList.remove(
            "hidden"
        );

        placementUnlockedMessage?.classList.add(
            "hidden"
        );


        if (journeyLabel) {

            journeyLabel.textContent =
                "Academic Journey Active";
        }


        if (heroDescription) {

            heroDescription.textContent =
                "Build your academic foundation, develop practical skills and follow your personalized career roadmap.";
        }

    }
};



// ============================================================
// LOAD DASHBOARD
// ============================================================

const loadStudentDashboard = async () => {

    const loading =
        document.getElementById(
            "dashboardLoading"
        );


    const errorContainer =
        document.getElementById(
            "dashboardError"
        );


    const errorMessage =
        document.getElementById(
            "dashboardErrorMessage"
        );


    const content =
        document.getElementById(
            "dashboardContent"
        );


    try {

        const data =
            await apiRequest(
                "/student-dashboard/"
            );


        const dashboard =
            data.dashboard;


        console.log(
            "CareerReady dashboard:",
            dashboard
        );


        // ====================================================
        // PROFILE
        // ====================================================

        const profile =
            dashboard.profile;


        document.getElementById(
            "welcomeName"
        ).textContent =
            profile.name || "Student";


        document.getElementById(
            "profileStatus"
        ).textContent =
            formatText(
                profile.profileStatus
            );


        document.getElementById(
            "studentCgpa"
        ).textContent =
            profile.cgpa ??
            "--";


        document.getElementById(
            "university"
        ).textContent =
            profile.university ||
            "--";


        document.getElementById(
            "degree"
        ).textContent =
            profile.degree ||
            "--";


        document.getElementById(
            "specialization"
        ).textContent =
            profile.specialization ||
            "--";


        document.getElementById(
            "graduationYear"
        ).textContent =
            profile.graduationYear ||
            "--";


        renderSkills(
            profile.skills || []
        );


        // ====================================================
        // ACADEMIC
        // ====================================================

        const academic =
            dashboard.academic;


        document.getElementById(
            "stageTitle"
        ).textContent =
            academic.stageTitle ||
            "Academic Development";


        document.getElementById(
            "stageDescription"
        ).textContent =
            academic.description ||
            "";


        document.getElementById(
            "academicYear"
        ).textContent =
            `Year ${academic.academicYear}`;


        document.getElementById(
            "currentSemester"
        ).textContent =
            `Semester ${academic.currentSemester}`;


        document.getElementById(
            "programDuration"
        ).textContent =
            `${academic.programDuration} Years`;


        updatePlacementVisibility(
            Boolean(
                academic.placementAccess
            )
        );


        // ====================================================
        // READINESS
        // ====================================================

        const readiness =
            dashboard.readiness;


        if (
            readiness &&
            readiness.overallScore !== null &&
            readiness.overallScore !== undefined
        ) {

            document.getElementById(
                "readinessScore"
            ).textContent =
                Number(
                    readiness.overallScore
                ).toFixed(2);


            document.getElementById(
                "readinessLevel"
            ).textContent =
                formatText(
                    readiness.readinessLevel
                );

        } else {

            document.getElementById(
                "readinessScore"
            ).textContent =
                "--";


            document.getElementById(
                "readinessLevel"
            ).textContent =
                "Not Assessed";

        }


        // ====================================================
        // ROADMAP
        // ====================================================

        const roadmap =
            dashboard.roadmap;


        renderRoadmapList(
            "roadmapLearning",
            roadmap?.learning || []
        );


        renderRoadmapList(
            "roadmapProjects",
            roadmap?.projects || []
        );


        // ====================================================
        // PLACEMENT DATA
        // ====================================================

        if (
            academic.placementAccess
        ) {

            renderRecommendedRoles(
                dashboard.recommendedRoles || []
            );


            renderApplications(
                dashboard.applications?.recent || []
            );


            renderPreparationChecklist(
                dashboard.preparationChecklist || []
            );

        }


        // ====================================================
        // SHOW DASHBOARD
        // ====================================================

        loading.classList.add(
            "hidden"
        );


        errorContainer.classList.add(
            "hidden"
        );


        content.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "STUDENT DASHBOARD ERROR:",
            error
        );


        loading.classList.add(
            "hidden"
        );


        errorMessage.textContent =
            error.message ||
            "Unable to load dashboard.";


        errorContainer.classList.remove(
            "hidden"
        );

    }

};



// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            !getAuthToken()
        ) {

            window.location.href =
                "../login.html";

            return;
        }


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutStudent
            );

        }


        loadStudentDashboard();

    }
);