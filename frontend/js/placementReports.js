// ============================================================
// CareerReady - Placement Reports
// ============================================================

const checkPlacementAccess = () => {

    const token =
        localStorage.getItem("careerReadyToken");

    const user =
        JSON.parse(
            localStorage.getItem("careerReadyUser") || "null"
        );

    if (
        !token ||
        !user ||
        user.role !== "PLACEMENT"
    ) {

        window.location.href = "../login.html";

        return false;
    }

    return true;
};


// ============================================================
// HELPERS
// ============================================================

const escapeHtml = (value) => {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

};


const getCurrentDate = () => {

    return new Date().toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

};


// ============================================================
// LOAD REPORT
// ============================================================

const loadReport = async () => {

    const loading =
        document.getElementById(
            "loadingState"
        );

    const report =
        document.getElementById(
            "reportContent"
        );

    const error =
        document.getElementById(
            "errorMessage"
        );


    loading.classList.remove("hidden");
    report.classList.add("hidden");
    error.classList.add("hidden");


    try {

        const [
            profilesResponse,
            verifiedResponse,
            readinessResponse,
            applicationResponse,
            drivesResponse
        ] = await Promise.all([

            apiRequest(
                "/placement/profiles"
            ),

            apiRequest(
                "/placement/profiles/verified"
            ),

            apiRequest(
                "/placement-dashboard/readiness"
            ),

            apiRequest(
                "/placement-dashboard/application-summary"
            ),

            apiRequest(
                "/drives"
            )

        ]);


        const submittedProfiles =
            Array.isArray(
                profilesResponse.profiles
            )
                ? profilesResponse.profiles
                : [];


        const verifiedProfiles =
            Array.isArray(
                verifiedResponse.profiles
            )
                ? verifiedResponse.profiles
                : [];


        const readiness =
            readinessResponse.dashboard ||
            {};


        const applications =
            applicationResponse.applicationSummary ||
            {};


        const drives =
            Array.isArray(
                drivesResponse.drives
            )
                ? drivesResponse.drives
                : [];


        // ----------------------------------------------------
        // Student statistics
        // ----------------------------------------------------

        const allProfiles =
            new Map();


        submittedProfiles.forEach(
            profile => {

                allProfiles.set(
                    profile._id,
                    profile
                );

            }
        );


        verifiedProfiles.forEach(
            profile => {

                allProfiles.set(
                    profile._id,
                    profile
                );

            }
        );


        const students =
            Array.from(
                allProfiles.values()
            );


        const cgpas =
            students
                .map(
                    student =>
                        Number(student.cgpa)
                )
                .filter(
                    cgpa =>
                        Number.isFinite(cgpa)
                );


        const averageCgpa =
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
        ).textContent =
            readiness.totalStudents ??
            students.length;


        document.getElementById(
            "verifiedStudents"
        ).textContent =
            readiness.verifiedProfiles ??
            verifiedProfiles.length;


        document.getElementById(
            "averageCgpa"
        ).textContent =
            averageCgpa;


        document.getElementById(
            "averageReadiness"
        ).textContent =
            readiness.averageReadinessScore !==
            null &&
            readiness.averageReadinessScore !==
            undefined
                ? `${readiness.averageReadinessScore}%`
                : "--";


        // ----------------------------------------------------
        // Readiness
        // ----------------------------------------------------

        const summary =
            readiness.readinessSummary ||
            {};


        document.getElementById(
            "highlyReady"
        ).textContent =
            summary.HIGHLY_READY || 0;


        document.getElementById(
            "moderatelyReady"
        ).textContent =
            summary.MODERATELY_READY || 0;


        document.getElementById(
            "needsPreparation"
        ).textContent =
            summary.NEEDS_PREPARATION || 0;


        document.getElementById(
            "notReady"
        ).textContent =
            summary.NOT_READY || 0;


        document.getElementById(
            "notAssessed"
        ).textContent =
            summary.NOT_ASSESSED ||
            readiness.unassessedStudents ||
            0;


        // ----------------------------------------------------
        // Applications
        // ----------------------------------------------------

        renderApplicationTable(
            applications
        );


        // ----------------------------------------------------
        // Drives
        // ----------------------------------------------------

        renderDrives(
            drives
        );


        // ----------------------------------------------------
        // Dates
        // ----------------------------------------------------

        const today =
            getCurrentDate();


        document.getElementById(
            "generatedDate"
        ).textContent =
            today;


        document.getElementById(
            "reportDate"
        ).textContent =
            `Generated on ${today}`;


        report.classList.remove(
            "hidden"
        );


    } catch (err) {

        console.error(
            "REPORT ERROR:",
            err
        );


        error.textContent =
            err.message ||
            "Failed to generate placement report.";


        error.classList.remove(
            "hidden"
        );

    } finally {

        loading.classList.add(
            "hidden"
        );

    }

};


// ============================================================
// APPLICATION TABLE
// ============================================================

const renderApplicationTable = (
    applications
) => {

    const table =
        document.getElementById(
            "applicationTable"
        );


    const statuses = [

        "REGISTERED",
        "SHORTLISTED",
        "ASSESSMENT",
        "INTERVIEW",
        "SELECTED",
        "REJECTED"

    ];


    const total =
        statuses.reduce(
            (sum, status) =>
                sum +
                Number(
                    applications[status] || 0
                ),
            0
        );


    table.innerHTML = "";


    statuses.forEach(
        status => {

            const count =
                Number(
                    applications[status] ||
                    0
                );


            const share =
                total
                    ? (
                        count /
                        total *
                        100
                    ).toFixed(1)
                    : "0.0";


            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "border-b border-slate-100";


            row.innerHTML = `

                <td class="py-3 pr-4 font-semibold">
                    ${escapeHtml(status)}
                </td>

                <td class="py-3 px-4">
                    ${count}
                </td>

                <td class="py-3 pl-4 text-slate-500">
                    ${share}%
                </td>

            `;


            table.appendChild(row);

        }
    );

};


// ============================================================
// DRIVE LIST
// ============================================================

const renderDrives = (
    drives
) => {

    const container =
        document.getElementById(
            "driveList"
        );


    document.getElementById(
        "totalDrives"
    ).textContent =
        drives.length;


    container.innerHTML = "";


    if (!drives.length) {

        container.innerHTML = `

            <div class="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No recruitment drives available.
            </div>

        `;

        return;

    }


    drives.forEach(
        drive => {

            const roleCount =
                Array.isArray(
                    drive.roles
                )
                    ? drive.roles.length
                    : 0;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "rounded-xl border border-slate-200 p-5";


            item.innerHTML = `

                <div class="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-3
                ">

                    <div>

                        <h4 class="font-bold">
                            ${escapeHtml(
                                drive.companyName ||
                                "Company"
                            )}
                        </h4>

                        <p class="text-sm text-slate-500 mt-1">
                            ${escapeHtml(
                                drive.driveTitle ||
                                "--"
                            )}
                        </p>

                    </div>


                    <div class="flex items-center gap-3">

                        <span class="
                            px-3
                            py-1
                            rounded-full
                            bg-blue-50
                            text-blue-700
                            text-xs
                            font-bold
                        ">
                            ${escapeHtml(
                                drive.status ||
                                "--"
                            )}
                        </span>


                        <span class="text-sm text-slate-500">
                            ${roleCount} role${roleCount === 1 ? "" : "s"}
                        </span>

                    </div>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

};


// ============================================================
// PRINT / PDF
// ============================================================

const printReport = () => {

    window.print();

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
// EVENTS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!checkPlacementAccess()) {

            return;

        }


        document
            .getElementById(
                "refreshButton"
            )
            .addEventListener(
                "click",
                loadReport
            );


        document
            .getElementById(
                "printButton"
            )
            .addEventListener(
                "click",
                printReport
            );


        document
            .getElementById(
                "logoutButton"
            )
            .addEventListener(
                "click",
                logout
            );


        loadReport();

    }
);