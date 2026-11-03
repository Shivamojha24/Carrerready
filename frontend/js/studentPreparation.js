// ============================================================
// CareerReady - Student Preparation Page
// ============================================================

let recommendedRoles = [];


// ============================================================
// LOAD PREPARATION PAGE
// ============================================================

const loadPreparation = async () => {

    const loading =
        document.getElementById("pageLoading");

    const content =
        document.getElementById("pageContent");

    const errorBox =
        document.getElementById("pageError");

    const errorMessage =
        document.getElementById("pageErrorMessage");


    try {

        const response =
            await apiRequest(
                "/student-dashboard/"
            );


        const dashboard =
            response.dashboard;


        if (!dashboard) {

            throw new Error(
                "Student dashboard data was not returned."
            );

        }


        // ----------------------------------------------------
        // READINESS
        // ----------------------------------------------------

        const readinessScore =
            dashboard.readiness?.overallScore;


        const readinessLevel =
            dashboard.readiness?.readinessLevel ||
            "NOT_ASSESSED";


        const readinessElement =
            document.getElementById(
                "readinessScore"
            );


        const readinessLevelElement =
            document.getElementById(
                "readinessLevel"
            );


        if (
            readinessScore !== null &&
            readinessScore !== undefined
        ) {

            readinessElement.textContent =
                Math.round(
                    Number(readinessScore)
                );

        } else {

            readinessElement.textContent =
                "--";

        }


        readinessLevelElement.textContent =
            formatReadinessLevel(
                readinessLevel
            );



        // ----------------------------------------------------
        // RECOMMENDED ROLES
        // ----------------------------------------------------

        recommendedRoles =
            Array.isArray(
                dashboard.recommendedRoles
            )
                ? dashboard.recommendedRoles
                : [];


        calculateAverageSkillMatch();


        // ----------------------------------------------------
        // PREPARATION CHECKLIST
        // ----------------------------------------------------

        const checklist =
            Array.isArray(
                dashboard.preparationChecklist
            )
                ? dashboard.preparationChecklist
                : [];


        document.getElementById(
            "taskCount"
        ).textContent =
            checklist.length;


        renderChecklist(
            checklist
        );


        // ----------------------------------------------------
        // AI DRIVE SELECTOR
        // ----------------------------------------------------

        populateDriveSelect();


        // ----------------------------------------------------
        // SHOW PAGE
        // ----------------------------------------------------

        loading.classList.add(
            "hidden"
        );


        content.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Preparation page error:",
            error
        );


        loading.classList.add(
            "hidden"
        );


        errorMessage.textContent =
            error.message ||
            "Failed to load preparation page.";


        errorBox.classList.remove(
            "hidden"
        );

    }

};


// ============================================================
// FORMAT READINESS LEVEL
// ============================================================

const formatReadinessLevel = (
    level
) => {

    if (!level) {
        return "Not Assessed";
    }


    const normalized =
        String(level)
            .trim()
            .toUpperCase()
            .replace(/[\s-]+/g, "_");


    switch (normalized) {

        case "HIGHLY_READY":
            return "Highly Ready";

        case "MODERATELY_READY":
            return "Moderately Ready";

        case "NEEDS_PREPARATION":
            return "Needs Preparation";

        case "NOT_READY":
            return "Not Ready";

        case "NOT_ASSESSED":
            return "Not Assessed";

        default:
            return level;

    }

};


// ============================================================
// CALCULATE OVERALL ROLE MATCH
// ============================================================

const calculateAverageSkillMatch = () => {

    const element =
        document.getElementById(
            "skillMatch"
        );


    if (!recommendedRoles.length) {

        element.textContent =
            "--";

        return;

    }


    const matches =
        recommendedRoles
            .map(
                role =>
                    Number(
                        role.skillMatch
                    )
            )
            .filter(
                value =>
                    Number.isFinite(value)
            );


    if (!matches.length) {

        element.textContent =
            "--";

        return;

    }


    const total =
        matches.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    const average =
        total /
        matches.length;


    element.textContent =
        average.toFixed(1);

};


// ============================================================
// POPULATE RECRUITMENT DRIVES
// ============================================================

const populateDriveSelect = () => {

    const driveSelect =
        document.getElementById(
            "aiDriveSelect"
        );


    if (!driveSelect) {
        return;
    }


    driveSelect.innerHTML = `
        <option value="">
            Select recruitment drive
        </option>
    `;


    if (!recommendedRoles.length) {

        driveSelect.innerHTML = `
            <option value="">
                No available recruitment roles
            </option>
        `;

        return;

    }


    // --------------------------------------------------------
    // GROUP ROLES BY DRIVE
    // --------------------------------------------------------

    const drives =
        new Map();


    recommendedRoles.forEach(
        role => {

            const driveId =
                String(
                    role.driveId
                );


            if (!drives.has(driveId)) {

                drives.set(
                    driveId,
                    {
                        driveId,
                        companyName:
                            role.companyName ||
                            "Company",
                        driveTitle:
                            role.driveTitle ||
                            "Recruitment Drive"
                    }
                );

            }

        }
    );


    drives.forEach(
        drive => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                drive.driveId;


            option.textContent =
                `${drive.companyName} — ${drive.driveTitle}`;


            driveSelect.appendChild(
                option
            );

        }
    );

};


// ============================================================
// POPULATE ROLES
// ============================================================

const populateRoleSelect = () => {

    const driveSelect =
        document.getElementById(
            "aiDriveSelect"
        );


    const roleSelect =
        document.getElementById(
            "aiRoleSelect"
        );


    const generateButton =
        document.getElementById(
            "generateAiButton"
        );


    const driveId =
        driveSelect.value;


    roleSelect.innerHTML = `
        <option value="">
            Select target role
        </option>
    `;


    roleSelect.disabled =
        true;


    generateButton.disabled =
        true;


    if (!driveId) {
        return;
    }


    const roles =
        recommendedRoles.filter(
            role =>
                String(
                    role.driveId
                ) ===
                String(driveId)
        );


    if (!roles.length) {
        return;
    }


    roles.forEach(
        role => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                role.roleId;


            option.textContent =
                role.roleTitle;


            roleSelect.appendChild(
                option
            );

        }
    );


    roleSelect.disabled =
        false;

};


// ============================================================
// UPDATE AI BUTTON
// ============================================================

const updateAiButton = () => {

    const driveId =
        document.getElementById(
            "aiDriveSelect"
        ).value;


    const roleId =
        document.getElementById(
            "aiRoleSelect"
        ).value;


    const button =
        document.getElementById(
            "generateAiButton"
        );


    button.disabled =
        !driveId ||
        !roleId;

};


// ============================================================
// GENERATE AI PREPARATION
// ============================================================

const generateAiAdvice = async () => {

    const driveId =
        document.getElementById(
            "aiDriveSelect"
        ).value;


    const roleId =
        document.getElementById(
            "aiRoleSelect"
        ).value;


    const button =
        document.getElementById(
            "generateAiButton"
        );


    const loading =
        document.getElementById(
            "aiLoading"
        );


    const result =
        document.getElementById(
            "aiResult"
        );


    const error =
        document.getElementById(
            "aiError"
        );


    if (!driveId || !roleId) {
        return;
    }


    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

    error.classList.add(
        "hidden"
    );


    result.classList.add(
        "hidden"
    );


    loading.classList.remove(
        "hidden"
    );


    button.disabled =
        true;


    try {

        // ----------------------------------------------------
        // AI API REQUEST
        // ----------------------------------------------------

        const response =
            await apiRequest(
                "/ai/preparation",
                {
                    method: "POST",

                    body: JSON.stringify({
                        driveId,
                        roleId
                    })
                }
            );


        const data =
            response.data;


        if (!data) {

            throw new Error(
                "AI response was empty."
            );

        }


        // ----------------------------------------------------
        // TARGET
        // ----------------------------------------------------

        document.getElementById(
            "aiTargetRole"
        ).textContent =
            data.role?.title ||
            "Selected Role";


        document.getElementById(
            "aiCompany"
        ).textContent =
            data.drive?.companyName ||
            "Selected Company";


        // ----------------------------------------------------
        // READINESS
        // ----------------------------------------------------

        const readinessScore =
            data.readiness?.score;


        document.getElementById(
            "aiReadinessScore"
        ).textContent =
            readinessScore !== null &&
            readinessScore !== undefined
                ? `${readinessScore}/100`
                : "--";


        document.getElementById(
            "aiReadinessLevel"
        ).textContent =
            data.readiness?.level ||
            "Not assessed";


        // ----------------------------------------------------
        // ROLE SKILL MATCH
        // ----------------------------------------------------

        const skillMatch =
            data.skillMatch
                ?.requiredMatchPercentage;


        document.getElementById(
            "aiSkillMatch"
        ).textContent =
            skillMatch !== null &&
            skillMatch !== undefined
                ? `${skillMatch}%`
                : "--";


        // ----------------------------------------------------
        // MISSING SKILLS
        // ----------------------------------------------------

        renderAiMissingSkills(
            data.skillMatch
                ?.missingRequired || []
        );


        // ----------------------------------------------------
        // AI RESPONSE
        // ----------------------------------------------------

        document.getElementById(
            "aiAdvice"
        ).innerHTML =
            formatAIAdvice(
                data.advice ||
                "No preparation advice was returned."
            );


        // ----------------------------------------------------
        // SHOW RESULT
        // ----------------------------------------------------

        result.classList.remove(
            "hidden"
        );


        // Scroll result into view

        result.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (err) {

        console.error(
            "AI preparation error:",
            err
        );


        error.textContent =
            err.message ||
            "Failed to generate AI preparation advice.";


        error.classList.remove(
            "hidden"
        );


    } finally {

        loading.classList.add(
            "hidden"
        );


        updateAiButton();

    }

};


// ============================================================
// FORMAT AI MARKDOWN
// ============================================================

const formatAIAdvice = (
    text
) => {

    if (!text) {
        return "";
    }


    // --------------------------------------------------------
    // Escape HTML first
    // --------------------------------------------------------

    let source =
        escapeHtml(
            String(text)
        );


    // --------------------------------------------------------
    // Normalize line endings
    // --------------------------------------------------------

    source =
        source.replace(
            /\r\n/g,
            "\n"
        );


    source =
        source.replace(
            /\r/g,
            "\n"
        );


    // --------------------------------------------------------
    // Split into lines
    // --------------------------------------------------------

    const lines =
        source.split("\n");


    let html = "";

    let inUnorderedList = false;

    let inOrderedList = false;


    const closeLists = () => {

        if (inUnorderedList) {

            html += "</ul>";

            inUnorderedList =
                false;

        }


        if (inOrderedList) {

            html += "</ol>";

            inOrderedList =
                false;

        }

    };


    lines.forEach(
        line => {

            const trimmed =
                line.trim();


            // Empty line

            if (!trimmed) {

                closeLists();

                return;

            }


            // Horizontal rule

            if (
                trimmed === "---" ||
                trimmed === "***"
            ) {

                closeLists();

                html += `
                    <hr class="border-slate-700 my-5">
                `;

                return;

            }


            // H3

            if (
                trimmed.startsWith("### ")
            ) {

                closeLists();

                html += `
                    <h4 class="text-lg font-bold text-blue-400 mt-6 mb-3">
                        ${formatInlineMarkdown(
                            trimmed.substring(4)
                        )}
                    </h4>
                `;

                return;

            }


            // H2

            if (
                trimmed.startsWith("## ")
            ) {

                closeLists();

                html += `
                    <h3 class="text-xl font-bold text-white mt-6 mb-3">
                        ${formatInlineMarkdown(
                            trimmed.substring(3)
                        )}
                    </h3>
                `;

                return;

            }


            // H1

            if (
                trimmed.startsWith("# ")
            ) {

                closeLists();

                html += `
                    <h2 class="text-2xl font-bold text-white mt-6 mb-3">
                        ${formatInlineMarkdown(
                            trimmed.substring(2)
                        )}
                    </h2>
                `;

                return;

            }


            // Unordered list

            if (
                /^[-*]\s+/.test(trimmed)
            ) {

                if (!inUnorderedList) {

                    closeLists();

                    html += `
                        <ul class="list-disc pl-5 mt-3 mb-4 space-y-2">
                    `;

                    inUnorderedList =
                        true;

                }


                const item =
                    trimmed.replace(
                        /^[-*]\s+/,
                        ""
                    );


                html += `
                    <li class="text-slate-300">
                        ${formatInlineMarkdown(item)}
                    </li>
                `;

                return;

            }


            // Ordered list

            if (
                /^\d+\.\s+/.test(trimmed)
            ) {

                if (!inOrderedList) {

                    closeLists();

                    html += `
                        <ol class="list-decimal pl-5 mt-3 mb-4 space-y-2">
                    `;

                    inOrderedList =
                        true;

                }


                const item =
                    trimmed.replace(
                        /^\d+\.\s+/,
                        ""
                    );


                html += `
                    <li class="text-slate-300">
                        ${formatInlineMarkdown(item)}
                    </li>
                `;

                return;

            }


            // Normal paragraph

            closeLists();


            html += `
                <p class="text-slate-300 mb-3">
                    ${formatInlineMarkdown(trimmed)}
                </p>
            `;

        }
    );


    closeLists();


    return html;

};


// ============================================================
// FORMAT INLINE MARKDOWN
// ============================================================

const formatInlineMarkdown = (
    text
) => {

    let result =
        text;


    // Bold + italic

    result =
        result.replace(
            /\*\*\*(.*?)\*\*\*/g,
            '<strong class="text-white font-semibold italic">$1</strong>'
        );


    // Bold

    result =
        result.replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="text-white font-semibold">$1</strong>'
        );


    // Italic

    result =
        result.replace(
            /\*(.*?)\*/g,
            '<em class="text-slate-200">$1</em>'
        );


    // Inline code

    result =
        result.replace(
            /`(.*?)`/g,
            '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 text-xs">$1</code>'
        );


    return result;

};


// ============================================================
// RENDER AI MISSING SKILLS
// ============================================================

const renderAiMissingSkills = (
    skills = []
) => {

    const section =
        document.getElementById(
            "aiMissingSkillsSection"
        );


    const container =
        document.getElementById(
            "aiMissingSkills"
        );


    container.innerHTML =
        "";


    if (!skills.length) {

        section.classList.add(
            "hidden"
        );

        return;

    }


    skills.forEach(
        skill => {

            const badge =
                document.createElement(
                    "span"
                );


            badge.className =
                "px-3 py-1.5 rounded-full " +
                "bg-red-500/10 border " +
                "border-red-500/20 " +
                "text-red-300 text-xs " +
                "font-medium";


            badge.textContent =
                skill;


            container.appendChild(
                badge
            );

        }
    );


    section.classList.remove(
        "hidden"
    );

};


// ============================================================
// RENDER PREPARATION CHECKLIST
// ============================================================

const renderChecklist = (
    checklist = []
) => {

    const container =
        document.getElementById(
            "preparationChecklist"
        );


    if (!checklist.length) {

        container.innerHTML = `

            <div
                class="
                    rounded-2xl
                    border border-emerald-500/20
                    bg-emerald-500/5
                    p-6
                "
            >

                <p class="text-emerald-400 font-medium">
                    You currently have no immediate preparation tasks.
                </p>

                <p class="text-slate-400 text-sm mt-2">
                    Continue improving your skills and maintain your profile.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        checklist
            .map(
                item => {

                    const isHigh =
                        item.priority ===
                        "HIGH";


                    const priorityClass =
                        isHigh
                            ? "bg-red-500/10 border-red-500/20 text-red-300"
                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300";


                    const dotClass =
                        isHigh
                            ? "bg-red-400"
                            : "bg-yellow-400";


                    return `

                        <div
                            class="
                                rounded-2xl
                                border border-slate-800
                                bg-slate-900/70
                                p-5
                            "
                        >

                            <div class="flex gap-4">


                                <div
                                    class="
                                        mt-1.5
                                        w-3
                                        h-3
                                        rounded-full
                                        flex-shrink-0
                                        ${dotClass}
                                    "
                                ></div>


                                <div class="flex-1">


                                    <div
                                        class="
                                            flex
                                            flex-col
                                            sm:flex-row
                                            sm:items-start
                                            sm:justify-between
                                            gap-3
                                        "
                                    >


                                        <div>

                                            <h4 class="font-semibold text-white">
                                                ${escapeHtml(
                                                    item.task ||
                                                    "Preparation task"
                                                )}
                                            </h4>


                                            <p class="text-sm text-slate-400 mt-2">
                                                ${escapeHtml(
                                                    item.reason ||
                                                    ""
                                                )}
                                            </p>

                                        </div>


                                        <span
                                            class="
                                                inline-flex
                                                w-fit
                                                rounded-full
                                                border
                                                px-3
                                                py-1
                                                text-xs
                                                font-semibold
                                                ${priorityClass}
                                            "
                                        >
                                            ${escapeHtml(
                                                item.priority ||
                                                "MEDIUM"
                                            )}
                                        </span>

                                    </div>


                                    <div class="mt-4">

                                        <span
                                            class="
                                                inline-block
                                                rounded-full
                                                bg-slate-800
                                                px-3
                                                py-1
                                                text-xs
                                                text-slate-400
                                            "
                                        >
                                            ${escapeHtml(
                                                item.category ||
                                                "GENERAL"
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

};


// ============================================================
// ESCAPE HTML
// ============================================================

const escapeHtml = (
    value
) => {

    return String(
        value ?? ""
    )
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
// EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const driveSelect =
            document.getElementById(
                "aiDriveSelect"
            );


        const roleSelect =
            document.getElementById(
                "aiRoleSelect"
            );


        const generateButton =
            document.getElementById(
                "generateAiButton"
            );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        // ----------------------------------------------------
        // DRIVE CHANGE
        // ----------------------------------------------------

        if (driveSelect) {

            driveSelect.addEventListener(
                "change",
                () => {

                    populateRoleSelect();

                    updateAiButton();

                }
            );

        }


        // ----------------------------------------------------
        // ROLE CHANGE
        // ----------------------------------------------------

        if (roleSelect) {

            roleSelect.addEventListener(
                "change",
                () => {

                    updateAiButton();

                }
            );

        }


        // ----------------------------------------------------
        // AI BUTTON
        // ----------------------------------------------------

        if (generateButton) {

            generateButton.addEventListener(
                "click",
                generateAiAdvice
            );

        }


        // ----------------------------------------------------
        // LOGOUT
        // ----------------------------------------------------

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutStudent
            );

        }


        // ----------------------------------------------------
        // LOAD PAGE
        // ----------------------------------------------------

        loadPreparation();

    }
);