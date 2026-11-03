// ============================================================
// CareerReady - Placement Profile Verification
// ============================================================

let pendingProfiles = [];
let verifiedProfiles = [];
let selectedProfileId = null;


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
        "mb-6 rounded-xl px-5 py-4 text-sm";

    if (type === "success") {

        element.classList.add(
            "bg-emerald-50",
            "border",
            "border-emerald-200",
            "text-emerald-700"
        );

    } else {

        element.classList.add(
            "bg-red-50",
            "border",
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
// LOAD PROFILES
// ============================================================

const loadProfiles = async () => {

    const pendingLoading =
        document.getElementById("pendingLoading");

    const pendingEmpty =
        document.getElementById("pendingEmpty");

    const pendingContainer =
        document.getElementById("pendingContainer");

    const verifiedLoading =
        document.getElementById("verifiedLoading");

    const verifiedEmpty =
        document.getElementById("verifiedEmpty");

    const verifiedContainer =
        document.getElementById("verifiedContainer");


    pendingLoading.classList.remove("hidden");
    verifiedLoading.classList.remove("hidden");

    pendingEmpty.classList.add("hidden");
    verifiedEmpty.classList.add("hidden");

    pendingContainer.classList.add("hidden");
    verifiedContainer.classList.add("hidden");


    try {

        const [
            submittedResponse,
            verifiedResponse
        ] = await Promise.all([

            apiRequest("/placement/profiles"),

            apiRequest("/placement/profiles/verified")

        ]);


        pendingProfiles =
            Array.isArray(
                submittedResponse.profiles
            )
                ? submittedResponse.profiles
                : [];


        verifiedProfiles =
            Array.isArray(
                verifiedResponse.profiles
            )
                ? verifiedResponse.profiles
                : [];


        document.getElementById(
            "pendingCount"
        ).textContent =
            pendingProfiles.length;


        document.getElementById(
            "verifiedCount"
        ).textContent =
            verifiedProfiles.length;


        renderPendingProfiles();

        renderVerifiedProfiles();


    } catch (error) {

        showMessage(
            error.message ||
            "Failed to load verification data.",
            "error"
        );

    } finally {

        pendingLoading.classList.add("hidden");
        verifiedLoading.classList.add("hidden");

    }

};


// ============================================================
// RENDER PENDING
// ============================================================

const renderPendingProfiles = () => {

    const container =
        document.getElementById(
            "pendingContainer"
        );

    const empty =
        document.getElementById(
            "pendingEmpty"
        );


    container.innerHTML = "";


    if (!pendingProfiles.length) {

        empty.classList.remove("hidden");

        return;

    }


    empty.classList.add("hidden");


    pendingProfiles.forEach(profile => {

        const user =
            profile.user || {};


        const card =
            document.createElement("div");


        card.className =
            "student-card bg-white border border-slate-200 rounded-2xl p-6";


        card.innerHTML = `

            <div class="flex items-start justify-between gap-4">

                <div>

                    <h3 class="text-lg font-bold">
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


                <span class="
                    px-3 py-1
                    rounded-full
                    bg-amber-100
                    text-amber-700
                    text-xs
                    font-bold
                ">
                    PENDING
                </span>

            </div>


            <div class="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-4
                mt-5
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
                            profile.degree || "--"
                        )}
                    </p>

                </div>


                <div>

                    <p class="text-xs text-slate-400">
                        Specialization
                    </p>

                    <p class="text-sm font-semibold mt-1">
                        ${escapeHtml(
                            profile.specialization || "--"
                        )}
                    </p>

                </div>


                <div>

                    <p class="text-xs text-slate-400">
                        CGPA
                    </p>

                    <p class="text-sm font-semibold mt-1">
                        ${escapeHtml(
                            profile.cgpa ?? "--"
                        )}
                    </p>

                </div>


                <div>

                    <p class="text-xs text-slate-400">
                        Graduation
                    </p>

                    <p class="text-sm font-semibold mt-1">
                        ${escapeHtml(
                            profile.graduationYear || "--"
                        )}
                    </p>

                </div>

            </div>


            <button
                class="
                    view-profile-button
                    w-full
                    mt-6
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-4
                    py-3
                    font-semibold
                "
                data-profile-id="${profile._id}"
            >
                Review Profile →
            </button>

        `;


        container.appendChild(card);

    });


    container.classList.remove("hidden");

};


// ============================================================
// RENDER VERIFIED
// ============================================================

const renderVerifiedProfiles = () => {

    const container =
        document.getElementById(
            "verifiedContainer"
        );

    const empty =
        document.getElementById(
            "verifiedEmpty"
        );


    container.innerHTML = "";


    if (!verifiedProfiles.length) {

        empty.classList.remove("hidden");

        return;

    }


    empty.classList.add("hidden");


    verifiedProfiles.forEach(profile => {

        const user =
            profile.user || {};


        const card =
            document.createElement("div");


        card.className =
            "student-card bg-white border border-slate-200 rounded-2xl p-6";


        card.innerHTML = `

            <div class="flex items-start justify-between">

                <div>

                    <h3 class="text-lg font-bold">
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


                <span class="
                    px-3 py-1
                    rounded-full
                    bg-emerald-100
                    text-emerald-700
                    text-xs
                    font-bold
                ">
                    VERIFIED
                </span>

            </div>


            <div class="mt-5">

                <p class="text-xs text-slate-400">
                    Degree
                </p>

                <p class="font-semibold mt-1">
                    ${escapeHtml(
                        profile.degree || "--"
                    )}
                </p>

            </div>


            <div class="grid grid-cols-2 gap-4 mt-4">

                <div>

                    <p class="text-xs text-slate-400">
                        CGPA
                    </p>

                    <p class="font-semibold mt-1">
                        ${escapeHtml(
                            profile.cgpa ?? "--"
                        )}
                    </p>

                </div>


                <div>

                    <p class="text-xs text-slate-400">
                        Graduation
                    </p>

                    <p class="font-semibold mt-1">
                        ${escapeHtml(
                            profile.graduationYear || "--"
                        )}
                    </p>

                </div>

            </div>

        `;


        container.appendChild(card);

    });


    container.classList.remove("hidden");

};


// ============================================================
// OPEN PROFILE
// ============================================================

const openProfile = (
    profileId
) => {

    selectedProfileId =
        profileId;


    const profile =
        pendingProfiles.find(
            item =>
                item._id === profileId
        );


    if (!profile) {

        return;

    }


    const user =
        profile.user || {};


    document.getElementById(
        "studentName"
    ).textContent =
        user.name || "Student";


    document.getElementById(
        "studentEmail"
    ).textContent =
        user.email || "--";


    document.getElementById(
        "studentInitial"
    ).textContent =
        (user.name || "S")
            .charAt(0)
            .toUpperCase();


    document.getElementById(
        "university"
    ).textContent =
        profile.university || "--";


    document.getElementById(
        "degree"
    ).textContent =
        profile.degree || "--";


    document.getElementById(
        "specialization"
    ).textContent =
        profile.specialization || "--";


    document.getElementById(
        "programDuration"
    ).textContent =
        profile.programDuration
            ? `${profile.programDuration} Years`
            : "--";


    document.getElementById(
        "graduationYear"
    ).textContent =
        profile.graduationYear || "--";


    document.getElementById(
        "cgpa"
    ).textContent =
        profile.cgpa ?? "--";


    renderSkills(
        profile.skills || []
    );


    renderCertifications(
        profile.certifications || []
    );


    renderProjects(
        profile.projects || []
    );


    renderExperience(
        profile.experience || []
    );


    document.getElementById(
        "reviewComments"
    ).value = "";


    document.getElementById(
        "reviewModal"
    ).classList.remove("hidden");

};


// ============================================================
// SKILLS
// ============================================================

const renderSkills = (
    skills
) => {

    const container =
        document.getElementById(
            "skills"
        );


    container.innerHTML = "";


    if (!skills.length) {

        container.innerHTML =
            `<span class="text-sm text-slate-400">
                No skills added.
             </span>`;

        return;

    }


    skills.forEach(skill => {

        const badge =
            document.createElement("span");


        badge.className =
            "px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium";


        badge.textContent =
            skill;


        container.appendChild(
            badge
        );

    });

};


// ============================================================
// CERTIFICATIONS
// ============================================================

const renderCertifications = (
    certifications
) => {

    const container =
        document.getElementById(
            "certifications"
        );


    container.innerHTML = "";


    if (!certifications.length) {

        container.innerHTML =
            `<p class="text-sm text-slate-400">
                No certifications added.
             </p>`;

        return;

    }


    certifications.forEach(cert => {

        const item =
            document.createElement("div");


        item.className =
            "rounded-xl bg-slate-50 border border-slate-200 p-4";


        item.innerHTML = `

            <p class="font-semibold">
                ${escapeHtml(
                    cert.name || "Certification"
                )}
            </p>

            <p class="text-sm text-slate-500 mt-1">
                ${escapeHtml(
                    cert.provider || "Provider not specified"
                )}
            </p>

            ${
                cert.credentialId
                    ? `
                        <p class="text-xs text-slate-400 mt-2">
                            Credential ID:
                            ${escapeHtml(cert.credentialId)}
                        </p>
                      `
                    : ""
            }

        `;


        container.appendChild(item);

    });

};


// ============================================================
// PROJECTS
// ============================================================

const renderProjects = (
    projects
) => {

    const container =
        document.getElementById(
            "projects"
        );


    container.innerHTML = "";


    if (!projects.length) {

        container.innerHTML =
            `<p class="text-sm text-slate-400">
                No projects added.
             </p>`;

        return;

    }


    projects.forEach(project => {

        const item =
            document.createElement("div");


        item.className =
            "rounded-xl bg-slate-50 border border-slate-200 p-4";


        item.innerHTML = `

            <p class="font-semibold">
                ${escapeHtml(
                    project.title || "Project"
                )}
            </p>

            <p class="text-sm text-slate-500 mt-2">
                ${escapeHtml(
                    project.description || ""
                )}
            </p>

            ${
                project.technologies?.length
                    ? `
                        <p class="text-xs text-blue-600 mt-3">
                            ${escapeHtml(
                                project.technologies.join(", ")
                            )}
                        </p>
                      `
                    : ""
            }

        `;


        container.appendChild(item);

    });

};


// ============================================================
// EXPERIENCE
// ============================================================

const renderExperience = (
    experience
) => {

    const container =
        document.getElementById(
            "experience"
        );


    container.innerHTML = "";


    if (!experience.length) {

        container.innerHTML =
            `<p class="text-sm text-slate-400">
                No experience added.
             </p>`;

        return;

    }


    experience.forEach(item => {

        const entry =
            typeof item === "object"
                ? item
                : {
                    type: item
                };


        const card =
            document.createElement("div");


        card.className =
            "rounded-xl bg-slate-50 border border-slate-200 p-4";


        card.innerHTML = `

            <p class="font-semibold">
                ${escapeHtml(
                    entry.title ||
                    entry.type ||
                    "Experience"
                )}
            </p>

            <p class="text-sm text-blue-600 mt-1">
                ${escapeHtml(
                    entry.organization || ""
                )}
            </p>

            <p class="text-sm text-slate-500 mt-2">
                ${escapeHtml(
                    entry.description || ""
                )}
            </p>

        `;


        container.appendChild(card);

    });

};


// ============================================================
// REVIEW PROFILE
// ============================================================

const reviewProfile = async (
    decision
) => {

    if (!selectedProfileId) {

        return;

    }


    const comments =
        document.getElementById(
            "reviewComments"
        ).value.trim();


    const verifyButton =
        document.getElementById(
            "verifyButton"
        );

    const correctionButton =
        document.getElementById(
            "correctionButton"
        );


    verifyButton.disabled = true;
    correctionButton.disabled = true;


    try {

        const response =
            await apiRequest(
                `/placement/profiles/${selectedProfileId}/review`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        decision,
                        comments
                    })
                }
            );


        document.getElementById(
            "reviewModal"
        ).classList.add("hidden");


        selectedProfileId = null;


        showMessage(
            response.message ||
            "Profile review completed."
        );


        await loadProfiles();


    } catch (error) {

        showMessage(
            error.message ||
            "Failed to review profile.",
            "error"
        );

    } finally {

        verifyButton.disabled = false;
        correctionButton.disabled = false;

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
            .getElementById("refreshButton")
            .addEventListener(
                "click",
                loadProfiles
            );


        document
            .getElementById("logoutButton")
            .addEventListener(
                "click",
                logout
            );


        document
            .getElementById("closeModal")
            .addEventListener(
                "click",
                () => {

                    document
                        .getElementById("reviewModal")
                        .classList.add("hidden");

                }
            );


        document
            .getElementById("verifyButton")
            .addEventListener(
                "click",
                () => reviewProfile("APPROVED")
            );


        document
            .getElementById("correctionButton")
            .addEventListener(
                "click",
                () => reviewProfile("CORRECTION_REQUIRED")
            );


        document
            .getElementById("pendingContainer")
            .addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            ".view-profile-button"
                        );


                    if (!button) {

                        return;

                    }


                    openProfile(
                        button.dataset.profileId
                    );

                }
            );


        loadProfiles();

    }
);