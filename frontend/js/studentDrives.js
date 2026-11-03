let allDrives = [];
let activeFilter = "ALL";


/*
=========================================================
INITIALIZATION
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {
    setupFilters();
    setupRefresh();
    loadStudentDrives();
});


/*
=========================================================
LOAD STUDENT DRIVES
=========================================================
*/

async function loadStudentDrives() {
    const contentArea =
        document.getElementById("contentArea");

    contentArea.innerHTML = `
        <div class="state-box">
            <h3>Loading placement drives...</h3>
            <p>
                Please wait while we load the latest opportunities.
            </p>
        </div>
    `;

    try {
        const response =
            await window.apiRequest("/drives/student");

        allDrives = response.drives || [];

        updateSummary();
        renderDrives();

    } catch (error) {
        console.error(
            "Student drives error:",
            error
        );

        contentArea.innerHTML = `
            <div class="state-box error-box">
                <h3>Unable to load placement drives</h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Something went wrong while loading drives."
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
    const totalDrives =
        allDrives.length;

    let eligibleRoles = 0;
    let totalMatch = 0;
    let totalRoles = 0;

    allDrives.forEach((drive) => {
        (drive.roles || []).forEach((role) => {
            totalRoles++;

            if (role.eligible) {
                eligibleRoles++;
            }

            totalMatch +=
                Number(role.skillMatch) || 0;
        });
    });

    const averageMatch =
        totalRoles > 0
            ? Math.round(totalMatch / totalRoles)
            : 0;

    document.getElementById(
        "totalDrives"
    ).textContent = totalDrives;

    document.getElementById(
        "eligibleRoles"
    ).textContent = eligibleRoles;

    document.getElementById(
        "averageMatch"
    ).textContent = `${averageMatch}%`;
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

                buttons.forEach((item) => {
                    item.classList.remove(
                        "active"
                    );
                });

                button.classList.add(
                    "active"
                );

                activeFilter =
                    button.dataset.filter;

                renderDrives();
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
        loadStudentDrives
    );
}


/*
=========================================================
FILTER DRIVE DATA
=========================================================
*/

function getFilteredDrives() {

    if (activeFilter === "ALL") {
        return allDrives;
    }

    return allDrives
        .map((drive) => {

            const filteredRoles =
                (drive.roles || []).filter(
                    (role) => {

                        if (
                            activeFilter ===
                            "ELIGIBLE"
                        ) {
                            return role.eligible;
                        }

                        if (
                            activeFilter ===
                            "HIGH_MATCH"
                        ) {
                            return (
                                Number(
                                    role.skillMatch
                                ) >= 70
                            );
                        }

                        return true;
                    }
                );

            return {
                ...drive,
                roles: filteredRoles
            };
        })
        .filter(
            (drive) =>
                drive.roles &&
                drive.roles.length > 0
        );
}


/*
=========================================================
RENDER DRIVES
=========================================================
*/

function renderDrives() {
    const contentArea =
        document.getElementById(
            "contentArea"
        );

    const drives =
        getFilteredDrives();

    if (!drives.length) {

        contentArea.innerHTML = `
            <div class="state-box">
                <h3>No placement drives found</h3>

                <p>
                    There are no opportunities matching
                    the selected filter right now.
                </p>
            </div>
        `;

        return;
    }

    contentArea.innerHTML = `
        <div class="drives-grid">
            ${drives
                .map(
                    (drive) =>
                        createDriveCard(drive)
                )
                .join("")}
        </div>
    `;
}


/*
=========================================================
DRIVE CARD
=========================================================
*/

function createDriveCard(drive) {

    const statusClass =
        drive.status === "OPEN"
            ? "status-open"
            : "status-upcoming";

    const rolesHTML =
        (drive.roles || [])
            .map(
                (role) =>
                    createRoleCard(
                        role,
                        drive
                    )
            )
            .join("");

    return `
        <article class="drive-card">

            <div class="drive-card-header">

                <div class="company-row">

                    <div>
                        <h2 class="company-name">
                            ${escapeHTML(
                                drive.companyName
                            )}
                        </h2>

                        <p class="drive-title">
                            ${escapeHTML(
                                drive.driveTitle
                            )}
                        </p>
                    </div>

                    <span
                        class="status-badge ${statusClass}"
                    >
                        ${escapeHTML(
                            drive.status
                        )}
                    </span>

                </div>

                ${
                    drive.description
                        ? `
                            <p class="drive-description">
                                ${escapeHTML(
                                    drive.description
                                )}
                            </p>
                          `
                        : ""
                }

                <div class="drive-meta">

                    <div class="meta-item">

                        <span class="meta-label">
                            Application Deadline
                        </span>

                        <span class="meta-value">
                            ${formatDate(
                                drive.applicationDeadline
                            )}
                        </span>

                    </div>

                    <div class="meta-item">

                        <span class="meta-label">
                            Drive Date
                        </span>

                        <span class="meta-value">
                            ${
                                drive.driveDate
                                    ? formatDate(
                                        drive.driveDate
                                    )
                                    : "Not specified"
                            }
                        </span>

                    </div>

                </div>

            </div>


            <div class="roles-section">

                <h3 class="roles-heading">
                    Available Roles
                </h3>

                ${rolesHTML}

            </div>

        </article>
    `;
}


/*
=========================================================
ROLE CARD
=========================================================
*/

function createRoleCard(role, drive) {

    const match =
        Number(role.skillMatch) || 0;

    const matchWidth =
        Math.max(
            0,
            Math.min(match, 100)
        );

    const eligibilityClass =
        role.eligible
            ? "eligible"
            : "not-eligible";

    const eligibilityText =
        role.eligible
            ? "Eligible"
            : "Not Eligible";

    const matchedSkills =
        (role.matchedSkills || [])
            .map(
                (skill) =>
                    `
                    <span class="skill-tag matched">
                        ${escapeHTML(skill)}
                    </span>
                    `
            )
            .join("");

    const missingSkills =
        (role.missingSkills || [])
            .map(
                (skill) =>
                    `
                    <span class="skill-tag missing">
                        ${escapeHTML(skill)}
                    </span>
                    `
            )
            .join("");

    const requiredSkills =
        (role.requiredSkills || [])
            .map(
                (skill) =>
                    `
                    <span class="skill-tag">
                        ${escapeHTML(skill)}
                    </span>
                    `
            )
            .join("");

    return `
        <div class="role-card">

            <div class="role-top">

                <h4 class="role-title">
                    ${escapeHTML(
                        role.title
                    )}
                </h4>

                <span
                    class="eligibility-badge ${eligibilityClass}"
                >
                    ${eligibilityText}
                </span>

            </div>


            <div class="match-row">

                <span class="match-label">
                    Required Skill Match
                </span>

                <span class="match-value">
                    ${match}%
                </span>

            </div>


            <div class="progress-track">

                <div
                    class="progress-fill"
                    style="width: ${matchWidth}%"
                ></div>

            </div>


            <div class="role-info">

                <div class="skills-label">
                    Required Skills
                </div>

                ${
                    requiredSkills ||
                    `<span class="skill-tag">
                        No required skills specified
                    </span>`
                }

            </div>


            ${
                matchedSkills
                    ? `
                        <div class="role-info">

                            <div class="skills-label">
                                Your Matched Skills
                            </div>

                            ${matchedSkills}

                        </div>
                      `
                    : ""
            }


            ${
                missingSkills
                    ? `
                        <div class="role-info">

                            <div class="skills-label">
                                Skills to Improve
                            </div>

                            ${missingSkills}

                        </div>
                      `
                    : ""
            }


            <div class="cgpa-info">

                Minimum CGPA:
                ${
                    role.minimumCGPA !== null &&
                    role.minimumCGPA !== undefined
                        ? role.minimumCGPA
                        : "Not specified"
                }

            </div>


            ${
                role.eligible
                    ? `
                        <button
                            type="button"
                            class="apply-button"
                            onclick="applyForRole(
                                '${drive.driveId}',
                                '${role.roleId}',
                                this
                            )"
                        >
                            Apply Now
                        </button>
                      `
                    : `
                        <button
                            type="button"
                            class="apply-button disabled"
                            disabled
                        >
                            Not Eligible
                        </button>
                      `
            }

        </div>
    `;
}


/*
=========================================================
APPLY FOR ROLE
=========================================================
*/

async function applyForRole(
    driveId,
    roleId,
    button
) {
    const originalText =
        button.textContent;

    button.disabled = true;

    button.textContent =
        "Applying...";

    try {

        const response =
            await window.apiRequest(
                `/applications/${driveId}/role/${roleId}`,
                {
                    method: "POST"
                }
            );

        alert(
            response.message ||
            "Application submitted successfully"
        );

        button.textContent =
            "Applied";

        button.classList.add(
            "applied"
        );

    } catch (error) {

        console.error(
            "Application error:",
            error
        );

        alert(
            error.message ||
            "Failed to submit application"
        );

        button.disabled = false;

        button.textContent =
            originalText;
    }
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