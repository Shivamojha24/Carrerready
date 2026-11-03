/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        setupForm();
        setupProgressTracking();
    }
);


/* =========================================================
   FORM
========================================================= */

function setupForm() {

    const form =
        document.getElementById("assessmentForm");

    form.addEventListener(
        "submit",
        submitAssessment
    );
}


/* =========================================================
   SUBMIT ASSESSMENT
========================================================= */

async function submitAssessment(event) {

    event.preventDefault();

    clearMessage();


    /* -----------------------------------------------------
       TECHNICAL
    ----------------------------------------------------- */

    const technicalAnswers =
        getRadioValues([
            "technical1",
            "technical2",
            "technical3",
            "technical4",
            "technical5"
        ]);

    if (
        technicalAnswers.some(
            value => value === null
        )
    ) {

        showMessage(
            "Please answer all Technical questions.",
            "error"
        );

        return;
    }

    const technicalCorrect =
        technicalAnswers.reduce(
            (total, value) =>
                total + Number(value),
            0
        );

    const technical =
        (technicalCorrect / 5) * 100;


    /* -----------------------------------------------------
       APTITUDE
    ----------------------------------------------------- */

    const aptitudeAnswers =
        getRadioValues([
            "aptitude1",
            "aptitude2",
            "aptitude3",
            "aptitude4",
            "aptitude5"
        ]);

    if (
        aptitudeAnswers.some(
            value => value === null
        )
    ) {

        showMessage(
            "Please answer all Aptitude questions.",
            "error"
        );

        return;
    }

    const aptitudeCorrect =
        aptitudeAnswers.reduce(
            (total, value) =>
                total + Number(value),
            0
        );

    const aptitude =
        (aptitudeCorrect / 5) * 100;


    /* -----------------------------------------------------
       COMMUNICATION
    ----------------------------------------------------- */

    const communicationValues =
        getRequiredValues([
            "communication1",
            "communication2",
            "communication3"
        ]);

    if (!communicationValues) {

        showMessage(
            "Please complete all Communication questions.",
            "error"
        );

        return;
    }

    const communication =
        average(communicationValues);


    /* -----------------------------------------------------
       PROJECTS
    ----------------------------------------------------- */

    const projectValues =
        getRequiredValues([
            "projects1",
            "projects2",
            "projects3"
        ]);

    if (!projectValues) {

        showMessage(
            "Please complete all Project questions.",
            "error"
        );

        return;
    }

    const projects =
        average(projectValues);


    /* -----------------------------------------------------
       MOCK INTERVIEW
    ----------------------------------------------------- */

    const mockValues =
        getRequiredValues([
            "mock1",
            "mock2",
            "mock3"
        ]);

    if (!mockValues) {

        showMessage(
            "Please complete all Mock Interview questions.",
            "error"
        );

        return;
    }

    const mockInterview =
        average(mockValues);


    /* -----------------------------------------------------
       SUBMIT
    ----------------------------------------------------- */

    const submitButton =
        document.getElementById(
            "submitButton"
        );

    submitButton.disabled = true;

    submitButton.textContent =
        "Calculating...";


    try {

        const response =
            await window.apiRequest(
                "/readiness/assessment",
                {
                    method: "POST",

                    body: JSON.stringify({

                        technical,

                        aptitude,

                        communication,

                        projects,

                        mockInterview,

                        skillMatch: 0,

                        gaps: []

                    })
                }
            );


        showMessage(
            response.message ||
            "Readiness assessment saved successfully.",
            "success"
        );


        submitButton.textContent =
            "Assessment Completed";


        setTimeout(
            () => {

                window.location.href =
                    "./readiness.html";

            },
            1200
        );


    } catch (error) {

        console.error(
            "Assessment submission error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to save readiness assessment.",
            "error"
        );

        submitButton.disabled = false;

        submitButton.textContent =
            "Calculate Readiness";
    }
}


/* =========================================================
   RADIO VALUES
========================================================= */

function getRadioValues(names) {

    return names.map(
        name => {

            const selected =
                document.querySelector(
                    `input[name="${name}"]:checked`
                );

            if (!selected) {
                return null;
            }

            return selected.value;
        }
    );
}


/* =========================================================
   RATING VALUES
========================================================= */

function getRequiredValues(names) {

    const values =
        names.map(
            name => {

                const selected =
                    document.querySelector(
                        `input[name="${name}"]:checked`
                    );

                if (!selected) {
                    return null;
                }

                return Number(
                    selected.value
                );
            }
        );

    if (
        values.some(
            value => value === null
        )
    ) {
        return null;
    }

    return values;
}


/* =========================================================
   AVERAGE
========================================================= */

function average(values) {

    if (
        !Array.isArray(values) ||
        values.length === 0
    ) {
        return 0;
    }

    const total =
        values.reduce(
            (sum, value) =>
                sum + Number(value),
            0
        );

    return total / values.length;
}


/* =========================================================
   PROGRESS
========================================================= */

function setupProgressTracking() {

    const form =
        document.getElementById(
            "assessmentForm"
        );

    form.addEventListener(
        "change",
        updateProgress
    );

    updateProgress();
}


function updateProgress() {

    const totalQuestions = 19;

    const answered =
        document.querySelectorAll(
            "#assessmentForm input:checked"
        ).length;

    const percentage =
        Math.round(
            (answered / totalQuestions) * 100
        );

    document.getElementById(
        "progressPercent"
    ).textContent =
        `${percentage}%`;

    document.getElementById(
        "progressFill"
    ).style.width =
        `${percentage}%`;
}


/* =========================================================
   MESSAGES
========================================================= */

function showMessage(
    message,
    type
) {

    const box =
        document.getElementById(
            "messageBox"
        );

    box.textContent =
        message;

    box.className =
        "message-box";

    if (type === "success") {

        box.classList.add(
            "message-success"
        );

    } else {

        box.classList.add(
            "message-error"
        );
    }

    box.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function clearMessage() {

    const box =
        document.getElementById(
            "messageBox"
        );

    box.textContent = "";

    box.className =
        "message-box";
}