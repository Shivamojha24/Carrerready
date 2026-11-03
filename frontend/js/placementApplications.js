// ============================================================
// CareerReady - Placement Applications
// ============================================================

let allApplications = [];


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


const formatDate = (value) => {

    if (!value) {
        return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

};


// ============================================================
// STATUS STYLING
// ============================================================

const getStatusClass = (status) => {

    const classes = {

        REGISTERED:
            "bg-blue-50 text-blue-700 border-blue-200",

        SHORTLISTED:
            "bg-indigo-50 text-indigo-700 border-indigo-200",

        ASSESSMENT:
            "bg-amber-50 text-amber-700 border-amber-200",

        INTERVIEW:
            "bg-purple-50 text-purple-700 border-purple-200",

        SELECTED:
            "bg-emerald-50 text-emerald-700 border-emerald-200",

        REJECTED:
            "bg-red-50 text-red-700 border-red-200"

    };

    return classes[status] ||
        "bg-slate-50 text-slate-700 border-slate-200";

};


// ============================================================
// MESSAGE
// ============================================================

const showMessage = (
    message,
    type = "success"
) => {

    const element =
        document.getElementById("message");

    element.textContent = message;

    element.className =
        "mb-6 rounded-xl px-5 py-4 text-sm border";

    if (type === "success") {

        element.classList.add(
            "bg-emerald-50",
            "border-emerald-200",
            "text-emerald-700"
        );

    } else {

        element.classList.add(
            "bg-red-50",
            "border-red-200",
            "text-red-700"
        );

    }

    element.classList.remove("hidden");

    setTimeout(() => {

        element.classList.add("hidden");

    }, 4000);

};


// ============================================================
// LOAD APPLICATIONS
// ============================================================

const loadApplications = async () => {

    const loading =
        document.getElementById(
            "loadingState"
        );

    const empty =
        document.getElementById(
            "emptyState"
        );

    const container =
        document.getElementById(
            "applicationsContainer"
        );


    loading.classList.remove("hidden");
    empty.classList.add("hidden");
    container.classList.add("hidden");


    try {

        const response =
            await apiRequest(
                "/placement-applications"
            );


        allApplications =
            Array.isArray(
                response.applications
            )
                ? response.applications
                : [];


        updateSummary();

        applyFilters();


    } catch (error) {

        showMessage(
            error.message ||
            "Failed to load applications.",
            "error"
        );

    } finally {

        loading.classList.add(
            "hidden"
        );

    }

};


// ============================================================
// SUMMARY
// ============================================================

const updateSummary = () => {

    const count = (status) => {

        return allApplications.filter(
            application =>
                application.status === status
        ).length;

    };


    document.getElementById(
        "totalCount"
    ).textContent =
        allApplications.length;


    document.getElementById(
        "registeredCount"
    ).textContent =
        count("REGISTERED");


    document.getElementById(
        "shortlistedCount"
    ).textContent =
        count("SHORTLISTED");


    document.getElementById(
        "assessmentCount"
    ).textContent =
        count("ASSESSMENT");


    document.getElementById(
        "interviewCount"
    ).textContent =
        count("INTERVIEW");


    document.getElementById(
        "selectedCount"
    ).textContent =
        count("SELECTED");


    document.getElementById(
        "rejectedCount"
    ).textContent =
        count("REJECTED");

};


// ============================================================
// FILTER
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
        allApplications.filter(
            application => {

                const student =
                    application.student || {};

                const user =
                    student.user || {};

                const drive =
                    application.drive || {};


                const searchableText = [

                    user.name,

                    user.email,

                    drive.companyName,

                    drive.driveTitle,

                    application.roleTitle

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
                    application.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderApplications(filtered);

};


// ============================================================
// RENDER
// ============================================================

const renderApplications = (
    applications
) => {

    const container =
        document.getElementById(
            "applicationsContainer"
        );

    const empty =
        document.getElementById(
            "emptyState"
        );


    container.innerHTML = "";


    if (!applications.length) {

        container.classList.add(
            "hidden"
        );

        empty.classList.remove(
            "hidden"
        );

        return;

    }


    empty.classList.add(
        "hidden"
    );


    applications.forEach(
        application => {

            const student =
                application.student || {};

            const user =
                student.user || {};

            const drive =
                application.drive || {};


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "application-card bg-white border border-slate-200 rounded-2xl p-6";


            card.innerHTML = `

                <div class="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    gap-5
                ">

                    <!-- STUDENT -->

                    <div class="flex items-center gap-4 min-w-0">

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
                            flex-shrink-0
                        ">
                            ${escapeHtml(
                                (user.name || "S")
                                    .charAt(0)
                                    .toUpperCase()
                            )}
                        </div>


                        <div class="min-w-0">

                            <h3 class="font-bold text-lg truncate">
                                ${escapeHtml(
                                    user.name || "Student"
                                )}
                            </h3>

                            <p class="text-sm text-slate-500 truncate">
                                ${escapeHtml(
                                    user.email || "--"
                                )}
                            </p>

                        </div>

                    </div>


                    <!-- STATUS -->

                    <span class="
                        self-start
                        lg:self-center
                        px-3
                        py-1.5
                        rounded-full
                        border
                        text-xs
                        font-bold
                        ${getStatusClass(
                            application.status
                        )}
                    ">
                        ${escapeHtml(
                            application.status
                        )}
                    </span>

                </div>


                <!-- APPLICATION DETAILS -->

                <div class="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-4
                    gap-4
                    mt-6
                    pt-5
                    border-t
                    border-slate-100
                ">

                    <div>

                        <p class="text-xs text-slate-400">
                            Company
                        </p>

                        <p class="text-sm font-semibold mt-1">
                            ${escapeHtml(
                                drive.companyName || "--"
                            )}
                        </p>

                    </div>


                    <div>

                        <p class="text-xs text-slate-400">
                            Recruitment Drive
                        </p>

                        <p class="text-sm font-semibold mt-1">
                            ${escapeHtml(
                                drive.driveTitle || "--"
                            )}
                        </p>

                    </div>


                    <div>

                        <p class="text-xs text-slate-400">
                            Applied Role
                        </p>

                        <p class="text-sm font-semibold mt-1">
                            ${escapeHtml(
                                application.roleTitle || "--"
                            )}
                        </p>

                    </div>


                    <div>

                        <p class="text-xs text-slate-400">
                            Applied On
                        </p>

                        <p class="text-sm font-semibold mt-1">
                            ${formatDate(
                                application.appliedAt
                            )}
                        </p>

                    </div>

                </div>


                <!-- UPDATE -->

                <div class="
                    mt-6
                    pt-5
                    border-t
                    border-slate-100
                    flex
                    flex-col
                    md:flex-row
                    gap-3
                    md:items-end
                ">

                    <div class="flex-1">

                        <label class="block text-xs font-semibold text-slate-500 mb-2">
                            Update Application Status
                        </label>

                        <select
                            class="
                                status-select
                                w-full
                                rounded-xl
                                border
                                border-slate-300
                                px-4
                                py-3
                                bg-white
                                outline-none
                                focus:border-blue-500
                            "
                            data-application-id="${application._id}"
                        >

                            <option value="REGISTERED"
                                ${application.status === "REGISTERED" ? "selected" : ""}>
                                Registered
                            </option>

                            <option value="SHORTLISTED"
                                ${application.status === "SHORTLISTED" ? "selected" : ""}>
                                Shortlisted
                            </option>

                            <option value="ASSESSMENT"
                                ${application.status === "ASSESSMENT" ? "selected" : ""}>
                                Assessment
                            </option>

                            <option value="INTERVIEW"
                                ${application.status === "INTERVIEW" ? "selected" : ""}>
                                Interview
                            </option>

                            <option value="SELECTED"
                                ${application.status === "SELECTED" ? "selected" : ""}>
                                Selected
                            </option>

                            <option value="REJECTED"
                                ${application.status === "REJECTED" ? "selected" : ""}>
                                Rejected
                            </option>

                        </select>

                    </div>


                    <div class="flex-1">

                        <label class="block text-xs font-semibold text-slate-500 mb-2">
                            Notes
                        </label>

                        <input
                            type="text"
                            class="
                                notes-input
                                w-full
                                rounded-xl
                                border
                                border-slate-300
                                px-4
                                py-3
                                outline-none
                                focus:border-blue-500
                            "
                            data-application-id="${application._id}"
                            value="${escapeHtml(
                                application.notes || ""
                            )}"
                            placeholder="Optional note...">

                    </div>


                    <button
                        type="button"
                        class="
                            update-status-button
                            rounded-xl
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            px-6
                            py-3
                            font-semibold
                            whitespace-nowrap
                        "
                        data-application-id="${application._id}"
                    >
                        Update
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    container.classList.remove(
        "hidden"
    );

};


// ============================================================
// UPDATE APPLICATION STATUS
// ============================================================

const updateApplicationStatus = async (
    applicationId,
    button
) => {

    const card =
        button.closest(
            ".application-card"
        );


    const statusSelect =
        card.querySelector(
            ".status-select"
        );


    const notesInput =
        card.querySelector(
            ".notes-input"
        );


    const status =
        statusSelect.value;


    const notes =
        notesInput.value.trim();


    const originalText =
        button.textContent;


    button.disabled = true;

    button.textContent =
        "Updating...";


    try {

        const response =
            await apiRequest(
                `/placement-applications/${applicationId}/status`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        status,
                        notes
                    })
                }
            );


        showMessage(
            response.message ||
            "Application status updated successfully."
        );


        await loadApplications();


    } catch (error) {

        showMessage(
            error.message ||
            "Failed to update application status.",
            "error"
        );

    } finally {

        button.disabled = false;

        button.textContent =
            originalText;

    }

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
                "logoutButton"
            )
            .addEventListener(
                "click",
                logout
            );


        document
            .getElementById(
                "refreshButton"
            )
            .addEventListener(
                "click",
                loadApplications
            );


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
                "applicationsContainer"
            )
            .addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            ".update-status-button"
                        );


                    if (!button) {
                        return;
                    }


                    updateApplicationStatus(
                        button.dataset.applicationId,
                        button
                    );

                }
            );


        loadApplications();

    }
);