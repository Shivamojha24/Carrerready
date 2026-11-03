let allApplications = [];
let activeFilter = "ALL";


/*
=========================================================
INITIALIZATION
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {
    setupFilters();
    setupRefresh();
    loadApplications();
});


/*
=========================================================
LOAD APPLICATIONS
=========================================================
*/

async function loadApplications() {
    const contentArea =
        document.getElementById("contentArea");

    contentArea.innerHTML = `
        <div class="state-box">
            <h3>Loading applications...</h3>
            <p>
                Please wait while we load your applications.
            </p>
        </div>
    `;

    try {
        const response =
            await window.apiRequest("/applications/my");

        allApplications =
            response.applications || [];

        updateSummary();
        renderApplications();

    } catch (error) {
        console.error(
            "Applications error:",
            error
        );

        contentArea.innerHTML = `
            <div class="state-box error-box">

                <h3>
                    Unable to load applications
                </h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Something went wrong while loading applications."
                    )}
                </p>

            </div>
        `;
    }
}


/*
=========================================================
SUMMARY
=========================================================
*/

function updateSummary() {

    const total =
        allApplications.length;

    const active =
        allApplications.filter(
            (application) =>
                [
                    "REGISTERED",
                    "SHORTLISTED",
                    "ASSESSMENT",
                    "INTERVIEW"
                ].includes(
                    application.status
                )
        ).length;

    const selected =
        allApplications.filter(
            (application) =>
                application.status ===
                "SELECTED"
        ).length;

    document.getElementById(
        "totalApplications"
    ).textContent = total;

    document.getElementById(
        "activeApplications"
    ).textContent = active;

    document.getElementById(
        "selectedApplications"
    ).textContent = selected;
}


/*
=========================================================
FILTERS
=========================================================
*/

function setupFilters() {

    const buttons =
        document.querySelectorAll(
            ".filter-button"
        );

    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(
                    (item) => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );

                button.classList.add(
                    "active"
                );

                activeFilter =
                    button.dataset.filter;

                renderApplications();
            }
        );
    });
}


/*
=========================================================
REFRESH
=========================================================
*/

function setupRefresh() {

    const button =
        document.getElementById(
            "refreshButton"
        );

    button.addEventListener(
        "click",
        loadApplications
    );
}


/*
=========================================================
FILTER APPLICATIONS
=========================================================
*/

function getFilteredApplications() {

    if (activeFilter === "ALL") {
        return allApplications;
    }

    if (activeFilter === "INTERVIEW") {

        return allApplications.filter(
            (application) =>
                application.status ===
                "INTERVIEW"
        );
    }

    return allApplications.filter(
        (application) =>
            application.status ===
            activeFilter
    );
}


/*
=========================================================
RENDER APPLICATIONS
=========================================================
*/

function renderApplications() {

    const contentArea =
        document.getElementById(
            "contentArea"
        );

    const applications =
        getFilteredApplications();

    if (!applications.length) {

        contentArea.innerHTML = `
            <div class="state-box">

                <h3>
                    No applications found
                </h3>

                <p>
                    You don't have any applications
                    matching this filter.
                </p>

            </div>
        `;

        return;
    }

    contentArea.innerHTML = `
        <div class="applications-list">

            ${applications
                .map(
                    (application) =>
                        createApplicationCard(
                            application
                        )
                )
                .join("")}

        </div>
    `;
}


/*
=========================================================
APPLICATION CARD
=========================================================
*/

function createApplicationCard(
    application
) {

    const drive =
        application.drive || {};

    const status =
        application.status ||
        "REGISTERED";

    return `
        <article class="application-card">

            <div class="application-top">

                <div>

                    <h2 class="company-name">
                        ${escapeHTML(
                            drive.companyName ||
                            "Company"
                        )}
                    </h2>

                    <p class="drive-title">
                        ${escapeHTML(
                            drive.driveTitle ||
                            "Recruitment Drive"
                        )}
                    </p>

                </div>

                <span
                    class="status-badge status-${escapeHTML(
                        status
                    )}"
                >
                    ${formatStatus(status)}
                </span>

            </div>


            <h3 class="role-title">
                ${escapeHTML(
                    application.roleTitle ||
                    "Role"
                )}
            </h3>


            <div class="details-grid">

                <div class="detail-item">

                    <span class="detail-label">
                        Applied On
                    </span>

                    <span class="detail-value">
                        ${formatDate(
                            application.appliedAt
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-label">
                        Application Deadline
                    </span>

                    <span class="detail-value">
                        ${formatDate(
                            drive.applicationDeadline
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-label">
                        Drive Date
                    </span>

                    <span class="detail-value">
                        ${
                            drive.driveDate
                                ? formatDate(
                                    drive.driveDate
                                )
                                : "Not specified"
                        }
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-label">
                        Application ID
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            String(
                                application._id ||
                                ""
                            ).slice(-8)
                        )}
                    </span>

                </div>

            </div>

        </article>
    `;
}


/*
=========================================================
STATUS FORMAT
=========================================================
*/

function formatStatus(status) {

    const statusNames = {
        REGISTERED: "Registered",
        SHORTLISTED: "Shortlisted",
        ASSESSMENT: "Assessment",
        INTERVIEW: "Interview",
        SELECTED: "Selected",
        REJECTED: "Rejected"
    };

    return (
        statusNames[status] ||
        status
    );
}


/*
=========================================================
DATE FORMAT
=========================================================
*/

function formatDate(dateValue) {

    if (!dateValue) {
        return "Not specified";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Not specified";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/*
=========================================================
HTML ESCAPING
=========================================================
*/

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}