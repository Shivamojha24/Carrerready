let assessment = null;


/*
=========================================================
INITIALIZATION
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    loadReadiness
);


/*
=========================================================
LOAD READINESS
=========================================================
*/

async function loadReadiness() {

    const contentArea =
        document.getElementById("contentArea");

    try {

        const response =
            await window.apiRequest(
                "/readiness/assessment"
            );

        assessment =
            response.assessment;

        renderReadiness();

    } catch (error) {

        console.error(
            "READINESS ERROR:",
            error
        );

        if (
            error.message &&
            error.message.toLowerCase().includes(
                "readiness assessment not found"
            )
        ) {

            contentArea.innerHTML = `
                <div class="state-box">

                    <h3>
                        Readiness Assessment Not Available
                    </h3>

                    <p>
                        Your readiness assessment has not
                        been completed yet.
                    </p>

                </div>
            `;

            return;
        }

        contentArea.innerHTML = `
            <div class="state-box error-box">

                <h3>
                    Unable to load readiness analysis
                </h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Something went wrong."
                    )}
                </p>

            </div>
        `;
    }
}


/*
=========================================================
RENDER READINESS
=========================================================
*/

function renderReadiness() {

    const contentArea =
        document.getElementById(
            "contentArea"
        );

    const technical =
        getNumber(assessment.technical);

    const aptitude =
        getNumber(assessment.aptitude);

    const communication =
        getNumber(assessment.communication);

    const projects =
        getNumber(assessment.projects);

    const mockInterview =
        getNumber(assessment.mockInterview);

    const overall =
        getNumber(assessment.overall);

    const skillMatch =
        getNumber(assessment.skillMatch);


    contentArea.innerHTML = `

        <!-- =====================================================
             OVERALL
        ====================================================== -->

        <section class="overall-section">

            <div class="overall-card">

                <div class="overall-label">
                    Overall Placement Readiness
                </div>

                <div
                    class="score-circle"
                    style="border-color:${getScoreColor(
                        overall
                    )};"
                >

                    <div class="score-number">
                        ${formatScore(overall)}
                    </div>

                    <div class="score-out-of">
                        out of 100
                    </div>

                </div>

                <span
                    class="readiness-level ${getLevelClass(
                        assessment.readinessLevel
                    )}"
                >
                    ${formatLevel(
                        assessment.readinessLevel
                    )}
                </span>

            </div>


            <div class="score-section">

                <h2 class="section-title">
                    Readiness Components
                </h2>

                <div class="score-grid">

                    ${createScoreCard(
                        "Technical",
                        technical,
                        "Programming, technical skills and knowledge."
                    )}

                    ${createScoreCard(
                        "Aptitude",
                        aptitude,
                        "Quantitative, logical reasoning and verbal ability."
                    )}

                    ${createScoreCard(
                        "Communication",
                        communication,
                        "Communication and professional interaction."
                    )}

                    ${createScoreCard(
                        "Projects",
                        projects,
                        "Project experience and practical development."
                    )}

                    ${createScoreCard(
                        "Mock Interview",
                        mockInterview,
                        "Technical, HR and communication interview performance."
                    )}

                </div>

            </div>

        </section>


        <!-- =====================================================
             SKILL MATCH + GAPS
        ====================================================== -->

        <section class="lower-grid">

            <div class="skills-card">

                <h2 class="section-title">
                    Skill Match
                </h2>

                <div class="skill-match-value">
                    ${formatScore(skillMatch)}%
                </div>

                <div class="skill-progress">

                    <div
                        class="skill-progress-fill"
                        style="width:${safePercentage(
                            skillMatch
                        )}%"
                    ></div>

                </div>

                <p
                    style="
                        color:#64748b;
                        font-size:13px;
                        margin:14px 0 0;
                    "
                >
                    Percentage of required skills matched
                    with available placement roles.
                </p>

            </div>


            <div class="gaps-card">

                <h2 class="section-title">
                    Skill Gaps
                </h2>

                <div class="gap-list">

                    ${renderGaps(
                        assessment.gaps
                    )}

                </div>

            </div>

        </section>


        <!-- =====================================================
             SCORE BREAKDOWN
        ====================================================== -->

        <section class="breakdown-card">

            <h2 class="section-title">
                Readiness Score Weightage
            </h2>

            <table class="breakdown-table">

                <thead>

                    <tr>
                        <th>Component</th>
                        <th>Score</th>
                        <th>Weight</th>
                        <th>Contribution</th>
                    </tr>

                </thead>

                <tbody>

                    ${createBreakdownRow(
                        "Technical",
                        technical,
                        40
                    )}

                    ${createBreakdownRow(
                        "Aptitude",
                        aptitude,
                        20
                    )}

                    ${createBreakdownRow(
                        "Communication",
                        communication,
                        15
                    )}

                    ${createBreakdownRow(
                        "Projects",
                        projects,
                        15
                    )}

                    ${createBreakdownRow(
                        "Mock Interview",
                        mockInterview,
                        10
                    )}

                    <tr>

                        <td>
                            <strong>Overall</strong>
                        </td>

                        <td>
                            <strong>
                                ${formatScore(overall)}
                            </strong>
                        </td>

                        <td>
                            <strong>100%</strong>
                        </td>

                        <td>
                            <strong>
                                ${formatScore(overall)}
                            </strong>
                        </td>

                    </tr>

                </tbody>

            </table>

        </section>


        <!-- =====================================================
             EXPLANATION
        ====================================================== -->

        <section class="info-card">

            <h2 class="section-title">
                How Your Readiness Score Works
            </h2>

            <p>
                Your overall readiness score is calculated
                using Technical performance at 40%, Aptitude
                at 20%, Communication at 15%, Projects at 15%
                and Mock Interview performance at 10%.
                The result represents your current placement
                preparation level.
            </p>

        </section>

    `;
}


/*
=========================================================
SCORE CARD
=========================================================
*/

function createScoreCard(
    name,
    score,
    description
) {

    return `

        <div class="score-card">

            <div class="score-card-top">

                <span class="score-name">
                    ${name}
                </span>

                <span class="score-value">
                    ${formatScore(score)}%
                </span>

            </div>

            <div class="progress-track">

                <div
                    class="progress-fill"
                    style="
                        width:${safePercentage(score)}%;
                    "
                ></div>

            </div>

            <div class="score-description">
                ${description}
            </div>

        </div>

    `;
}


/*
=========================================================
BREAKDOWN ROW
=========================================================
*/

function createBreakdownRow(
    name,
    score,
    weight
) {

    const contribution =
        score === null
            ? 0
            : (
                Number(score) *
                Number(weight) /
                100
            );

    return `

        <tr>

            <td>
                ${name}
            </td>

            <td>
                ${formatScore(score)}
            </td>

            <td>
                ${weight}%
            </td>

            <td>
                ${contribution.toFixed(2)}
            </td>

        </tr>

    `;
}


/*
=========================================================
SKILL GAPS
=========================================================
*/

function renderGaps(gaps) {

    if (
        !Array.isArray(gaps) ||
        gaps.length === 0
    ) {

        return `
            <span class="no-gaps">
                No major skill gaps recorded.
            </span>
        `;
    }

    return gaps
        .map(
            (gap) => `
                <span class="gap-tag">
                    ${escapeHTML(gap)}
                </span>
            `
        )
        .join("");
}


/*
=========================================================
READINESS LEVEL
=========================================================
*/

function formatLevel(level) {

    const levels = {

        HIGHLY_READY:
            "Highly Ready",

        MODERATELY_READY:
            "Moderately Ready",

        NEEDS_PREPARATION:
            "Needs Preparation",

        NOT_READY:
            "Not Ready",

        NOT_ASSESSED:
            "Not Assessed"
    };

    return (
        levels[level] ||
        "Not Assessed"
    );
}


function getLevelClass(level) {

    if (level === "HIGHLY_READY") {
        return "level-high";
    }

    if (level === "MODERATELY_READY") {
        return "level-medium";
    }

    if (level === "NEEDS_PREPARATION") {
        return "level-needs";
    }

    if (level === "NOT_READY") {
        return "level-low";
    }

    return "level-none";
}


/*
=========================================================
HELPERS
=========================================================
*/

function getNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const number =
        Number(value);

    return Number.isNaN(number)
        ? null
        : number;
}


function formatScore(value) {

    if (value === null) {
        return "--";
    }

    return Number(value)
        .toFixed(1)
        .replace(".0", "");
}


function safePercentage(value) {

    if (value === null) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            100,
            Number(value)
        )
    );
}


function getScoreColor(score) {

    if (score === null) {
        return "#94a3b8";
    }

    if (score >= 80) {
        return "#16a34a";
    }

    if (score >= 60) {
        return "#2563eb";
    }

    if (score >= 40) {
        return "#d97706";
    }

    return "#dc2626";
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}