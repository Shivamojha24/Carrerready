let drives = [];
let editingDriveId = null;


// ============================================================
// AUTH
// ============================================================

const checkPlacementAccess = () => {

    const token = localStorage.getItem("careerReadyToken");
    const user = JSON.parse(
        localStorage.getItem("careerReadyUser") || "null"
    );

    if (!token || !user || user.role !== "PLACEMENT") {
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


const formatDate = (value) => {

    if (!value) {
        return "Not specified";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};


const toDateTimeLocal = (value) => {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const offset = date.getTimezoneOffset();

    const local = new Date(
        date.getTime() - offset * 60000
    );

    return local.toISOString().slice(0, 16);
};


// ============================================================
// MESSAGES
// ============================================================

const showMessage = (message, type = "success") => {

    const element = document.getElementById("driveMessage");

    if (!element) return;

    element.textContent = message;

    element.className =
        "mb-6 rounded-lg border px-4 py-3 text-sm";

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


const showFormMessage = (message) => {

    const element = document.getElementById("driveFormMessage");

    element.textContent = message;

    element.className =
        "mt-5 rounded-lg border px-4 py-3 text-sm bg-red-50 border-red-200 text-red-700";

    element.classList.remove("hidden");
};


const clearFormMessage = () => {

    const element = document.getElementById("driveFormMessage");

    element.classList.add("hidden");
    element.textContent = "";
};


// ============================================================
// ROLE INPUTS
// ============================================================

const createRoleCard = (role = {}, index = 0) => {

    const card = document.createElement("div");

    card.className = "role-card";

    card.dataset.roleCard = "true";

    card.innerHTML = `

        <div class="flex items-center justify-between mb-4">

            <h4 class="font-bold text-slate-800">
                Role ${index + 1}
            </h4>

            <button
                type="button"
                class="remove-role-button text-sm font-semibold text-red-600 hover:text-red-700"
            >
                Remove
            </button>

        </div>


        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="md:col-span-2">

                <label class="block text-sm font-semibold mb-2">
                    Role Title *
                </label>

                <input
                    data-role-title
                    type="text"
                    required
                    value="${escapeHtml(role.title || "")}"
                    placeholder="e.g. Software Engineer"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                >

            </div>


            <div>

                <label class="block text-sm font-semibold mb-2">
                    Required Skills
                </label>

                <input
                    data-role-required
                    type="text"
                    value="${escapeHtml(
                        (role.requiredSkills || []).join(", ")
                    )}"
                    placeholder="JavaScript, React, Node.js"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                >

                <p class="text-xs text-slate-500 mt-1">
                    Separate skills with commas.
                </p>

            </div>


            <div>

                <label class="block text-sm font-semibold mb-2">
                    Preferred Skills
                </label>

                <input
                    data-role-preferred
                    type="text"
                    value="${escapeHtml(
                        (role.preferredSkills || []).join(", ")
                    )}"
                    placeholder="AWS, Docker"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                >

            </div>


            <div>

                <label class="block text-sm font-semibold mb-2">
                    Minimum CGPA
                </label>

                <input
                    data-role-cgpa
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value="${
                        role.minimumCGPA !== undefined &&
                        role.minimumCGPA !== null
                            ? escapeHtml(role.minimumCGPA)
                            : ""
                    }"
                    placeholder="e.g. 7.0"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                >

            </div>


            <div>

                <label class="block text-sm font-semibold mb-2">
                    Eligible Degrees
                </label>

                <input
                    data-role-degrees
                    type="text"
                    value="${escapeHtml(
                        (role.eligibleDegrees || []).join(", ")
                    )}"
                    placeholder="B.Tech CSE, BCA"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                >

            </div>

        </div>
    `;

    return card;
};


const refreshRoleNumbers = () => {

    const cards = document.querySelectorAll(
        "[data-role-card]"
    );

    cards.forEach((card, index) => {

        const title = card.querySelector("h4");

        if (title) {
            title.textContent = `Role ${index + 1}`;
        }

    });
};


const addRole = (role = {}) => {

    const container = document.getElementById(
        "driveRolesContainer"
    );

    const card = createRoleCard(
        role,
        container.children.length
    );

    container.appendChild(card);

    refreshRoleNumbers();
};


// ============================================================
// COLLECT FORM
// ============================================================

const splitValues = (value) => {

    return String(value || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
};


const collectRoles = () => {

    const cards = document.querySelectorAll(
        "[data-role-card]"
    );

    return Array.from(cards).map(card => {

        const cgpa = card
            .querySelector("[data-role-cgpa]")
            .value
            .trim();

        return {

            title: card
                .querySelector("[data-role-title]")
                .value
                .trim(),

            requiredSkills: splitValues(
                card.querySelector("[data-role-required]").value
            ),

            preferredSkills: splitValues(
                card.querySelector("[data-role-preferred]").value
            ),

            eligibleDegrees: splitValues(
                card.querySelector("[data-role-degrees]").value
            ),

            minimumCGPA:
                cgpa === ""
                    ? undefined
                    : Number(cgpa)
        };

    });
};


const collectDriveForm = () => {

    return {

        companyName:
            document.getElementById("companyName").value.trim(),

        driveTitle:
            document.getElementById("driveTitle").value.trim(),

        description:
            document.getElementById("description").value.trim(),

        applicationDeadline:
            document.getElementById("applicationDeadline").value,

        driveDate:
            document.getElementById("driveDate").value,

        status:
            document.getElementById("driveStatus").value,

        roles:
            collectRoles()
    };
};


// ============================================================
// VALIDATION
// ============================================================

const validateDrive = (data) => {

    if (!data.companyName) {
        return "Company name is required.";
    }

    if (!data.driveTitle) {
        return "Drive title is required.";
    }

    if (!data.applicationDeadline) {
        return "Application deadline is required.";
    }

    const deadline = new Date(
        data.applicationDeadline
    );

    if (
        Number.isNaN(deadline.getTime())
    ) {
        return "Please enter a valid application deadline.";
    }

    if (deadline <= new Date()) {
        return "Application deadline must be in the future.";
    }

    if (!data.roles.length) {
        return "At least one role is required.";
    }

    for (let i = 0; i < data.roles.length; i++) {

        const role = data.roles[i];

        if (!role.title) {
            return `Role ${i + 1} must have a title.`;
        }

        if (
            role.minimumCGPA !== undefined &&
            (
                Number.isNaN(role.minimumCGPA) ||
                role.minimumCGPA < 0 ||
                role.minimumCGPA > 10
            )
        ) {
            return `Minimum CGPA for Role ${i + 1} must be between 0 and 10.`;
        }
    }

    return null;
};


// ============================================================
// RENDER DRIVES
// ============================================================

const renderDrives = (data = drives) => {

    const container =
        document.getElementById("drivesContainer");

    const empty =
        document.getElementById("drivesEmpty");

    const loading =
        document.getElementById("drivesLoading");

    const search =
        document.getElementById("searchDrives")
            .value
            .trim()
            .toLowerCase();

    const status =
        document.getElementById("statusFilter")
            .value;


    const filtered = data.filter(drive => {

        const text = [
            drive.companyName,
            drive.driveTitle,
            ...(drive.roles || []).map(role => role.title)
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            !search || text.includes(search);

        const matchesStatus =
            status === "ALL" ||
            drive.status === status;

        return matchesSearch && matchesStatus;
    });


    loading.classList.add("hidden");


    if (!filtered.length) {

        container.innerHTML = "";

        container.classList.add("hidden");

        empty.classList.remove("hidden");

        return;
    }


    empty.classList.add("hidden");

    container.classList.remove("hidden");


    container.innerHTML = filtered.map(drive => {

        const statusClasses = {

            OPEN:
                "bg-emerald-50 text-emerald-700 border-emerald-200",

            UPCOMING:
                "bg-blue-50 text-blue-700 border-blue-200",

            CLOSED:
                "bg-red-50 text-red-700 border-red-200",

            COMPLETED:
                "bg-violet-50 text-violet-700 border-violet-200"
        };


        const rolesHtml =
            (drive.roles || [])
                .map(role => {

                    return `
                        <div class="border border-slate-200 rounded-lg p-3">

                            <div class="flex items-center justify-between gap-3">

                                <p class="font-semibold text-sm text-slate-900">
                                    ${escapeHtml(role.title)}
                                </p>

                                ${
                                    role.minimumCGPA !== undefined &&
                                    role.minimumCGPA !== null
                                        ? `
                                            <span class="text-xs font-semibold text-amber-600">
                                                CGPA ${escapeHtml(role.minimumCGPA)}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            <p class="text-xs text-slate-500 mt-2">
                                <strong>Required:</strong>
                                ${escapeHtml(
                                    (role.requiredSkills || []).join(", ") ||
                                    "Not specified"
                                )}
                            </p>


                            ${
                                role.preferredSkills?.length
                                    ? `
                                        <p class="text-xs text-slate-500 mt-1">
                                            <strong>Preferred:</strong>
                                            ${escapeHtml(
                                                role.preferredSkills.join(", ")
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>
                    `;

                })
                .join("");


        return `

            <article class="drive-card">

                <div class="flex items-start justify-between gap-4">

                    <div>

                        <span
                            class="inline-block rounded-full border px-3 py-1 text-xs font-bold ${
                                statusClasses[drive.status] ||
                                statusClasses.UPCOMING
                            }"
                        >
                            ${escapeHtml(drive.status)}
                        </span>

                        <h3 class="text-lg font-bold text-slate-900 mt-3">
                            ${escapeHtml(drive.companyName)}
                        </h3>

                        <p class="text-sm text-slate-600 mt-1">
                            ${escapeHtml(drive.driveTitle)}
                        </p>

                    </div>

                    <span class="text-xs text-slate-400">
                        ${(drive.roles || []).length}
                        ${(drive.roles || []).length === 1 ? "Role" : "Roles"}
                    </span>

                </div>


                ${
                    drive.description
                        ? `
                            <p class="text-sm text-slate-500 mt-4 leading-6">
                                ${escapeHtml(drive.description)}
                            </p>
                        `
                        : ""
                }


                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                    <div class="rounded-lg bg-slate-50 p-3">

                        <p class="text-xs text-slate-500">
                            Application Deadline
                        </p>

                        <p class="text-sm font-semibold text-slate-800 mt-1">
                            ${formatDate(drive.applicationDeadline)}
                        </p>

                    </div>


                    <div class="rounded-lg bg-slate-50 p-3">

                        <p class="text-xs text-slate-500">
                            Drive Date
                        </p>

                        <p class="text-sm font-semibold text-slate-800 mt-1">
                            ${formatDate(drive.driveDate)}
                        </p>

                    </div>

                </div>


                <div class="mt-5">

                    <p class="text-xs uppercase tracking-wide text-slate-400 mb-2">
                        Roles
                    </p>

                    <div class="space-y-2">
                        ${rolesHtml}
                    </div>

                </div>


                <div class="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-200">

                    <button
                        type="button"
                        class="edit-drive-button rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        data-drive-id="${drive._id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-drive-button rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                        data-drive-id="${drive._id}"
                    >
                        Delete
                    </button>

                </div>

            </article>

        `;

    }).join("");
};


// ============================================================
// SUMMARY
// ============================================================

const updateSummary = () => {

    document.getElementById("totalDrives").textContent =
        drives.length;

    document.getElementById("openDrives").textContent =
        drives.filter(drive => drive.status === "OPEN").length;

    document.getElementById("upcomingDrives").textContent =
        drives.filter(drive => drive.status === "UPCOMING").length;

    document.getElementById("closedDrives").textContent =
        drives.filter(drive => drive.status === "CLOSED").length;
};


// ============================================================
// LOAD DRIVES
// ============================================================

const loadDrives = async () => {

    const loading =
        document.getElementById("drivesLoading");

    const container =
        document.getElementById("drivesContainer");

    const empty =
        document.getElementById("drivesEmpty");


    loading.classList.remove("hidden");

    container.classList.add("hidden");

    empty.classList.add("hidden");


    try {

        const response =
            await apiRequest("/drives");

        drives = response.drives || [];

        updateSummary();

        renderDrives();

    } catch (error) {

        loading.classList.add("hidden");

        showMessage(
            error.message ||
            "Failed to load recruitment drives.",
            "error"
        );

    }
};


// ============================================================
// CREATE / EDIT MODAL
// ============================================================

const openCreateModal = () => {

    editingDriveId = null;

    document.getElementById("driveForm").reset();

    document.getElementById("driveStatus").value =
        "UPCOMING";

    document.getElementById("driveRolesContainer").innerHTML =
        "";

    document.getElementById("driveModalTitle").textContent =
        "Create Recruitment Drive";

    document.getElementById("saveDriveButton").textContent =
        "Create Drive";

    clearFormMessage();

    addRole();

    document
        .getElementById("driveModal")
        .classList.remove("hidden");
};


const openEditModal = (drive) => {

    editingDriveId = drive._id;

    document.getElementById("companyName").value =
        drive.companyName || "";

    document.getElementById("driveTitle").value =
        drive.driveTitle || "";

    document.getElementById("description").value =
        drive.description || "";

    document.getElementById("applicationDeadline").value =
        toDateTimeLocal(drive.applicationDeadline);

    document.getElementById("driveDate").value =
        toDateTimeLocal(drive.driveDate);

    document.getElementById("driveStatus").value =
        drive.status || "UPCOMING";


    document.getElementById("driveRolesContainer").innerHTML =
        "";

    (drive.roles || []).forEach(role => {
        addRole(role);
    });


    if (!drive.roles?.length) {
        addRole();
    }


    document.getElementById("driveModalTitle").textContent =
        "Edit Recruitment Drive";

    document.getElementById("saveDriveButton").textContent =
        "Save Changes";

    clearFormMessage();

    document
        .getElementById("driveModal")
        .classList.remove("hidden");
};


const closeModal = () => {

    document
        .getElementById("driveModal")
        .classList.add("hidden");

    editingDriveId = null;
};


// ============================================================
// SAVE DRIVE
// ============================================================

const saveDrive = async (event) => {

    event.preventDefault();

    const data = collectDriveForm();

    const validationError =
        validateDrive(data);

    if (validationError) {

        showFormMessage(validationError);

        return;
    }


    const button =
        document.getElementById("saveDriveButton");

    button.disabled = true;

    button.textContent =
        editingDriveId
            ? "Saving..."
            : "Creating...";


    try {

        let response;


        if (editingDriveId) {

            response = await apiRequest(
                `/drives/${editingDriveId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data)
                }
            );

        } else {

            response = await apiRequest(
                "/drives",
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );

        }


        closeModal();

        showMessage(
            response.message ||
            "Recruitment drive saved successfully."
        );

        await loadDrives();

    } catch (error) {

        showFormMessage(
            error.message ||
            "Failed to save recruitment drive."
        );

    } finally {

        button.disabled = false;

        button.textContent =
            editingDriveId
                ? "Save Changes"
                : "Create Drive";
    }
};


// ============================================================
// DELETE DRIVE
// ============================================================

const deleteDrive = async (driveId) => {

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


        showMessage(
            response.message ||
            "Recruitment drive deleted successfully."
        );

        await loadDrives();

    } catch (error) {

        showMessage(
            error.message ||
            "Failed to delete recruitment drive.",
            "error"
        );
    }
};


// ============================================================
// LOGOUT
// ============================================================

const logout = () => {

    localStorage.removeItem("careerReadyToken");

    localStorage.removeItem("careerReadyUser");

    window.location.href = "../login.html";
};


// ============================================================
// EVENTS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!checkPlacementAccess()) {
        return;
    }


    document
        .getElementById("logoutButton")
        .addEventListener("click", logout);


    document
        .getElementById("mobileLogoutButton")
        .addEventListener("click", logout);


    document
        .getElementById("refreshDrivesButton")
        .addEventListener("click", loadDrives);


    document
        .getElementById("createDriveButton")
        .addEventListener("click", openCreateModal);


    document
        .getElementById("closeDriveModal")
        .addEventListener("click", closeModal);


    document
        .getElementById("cancelDriveButton")
        .addEventListener("click", closeModal);


    document
        .getElementById("addRoleButton")
        .addEventListener("click", () => addRole());


    document
        .getElementById("driveForm")
        .addEventListener("submit", saveDrive);


    document
        .getElementById("searchDrives")
        .addEventListener("input", () => renderDrives());


    document
        .getElementById("statusFilter")
        .addEventListener("change", () => renderDrives());


    document
        .getElementById("driveRolesContainer")
        .addEventListener("click", event => {

            const button =
                event.target.closest(
                    ".remove-role-button"
                );

            if (!button) {
                return;
            }

            const card =
                button.closest("[data-role-card]");

            if (card) {
                card.remove();
            }

            const container =
                document.getElementById(
                    "driveRolesContainer"
                );

            if (!container.children.length) {
                addRole();
            }

            refreshRoleNumbers();
        });


    document
        .getElementById("drivesContainer")
        .addEventListener("click", async event => {

            const editButton =
                event.target.closest(
                    ".edit-drive-button"
                );

            const deleteButton =
                event.target.closest(
                    ".delete-drive-button"
                );


            if (editButton) {

                const drive =
                    drives.find(
                        item =>
                            item._id ===
                            editButton.dataset.driveId
                    );

                if (drive) {
                    openEditModal(drive);
                }

                return;
            }


            if (deleteButton) {

                await deleteDrive(
                    deleteButton.dataset.driveId
                );
            }

        });


    loadDrives();

});