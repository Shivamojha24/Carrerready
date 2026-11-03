// ============================================================
// CareerReady - Placement Analytics
// ============================================================

let readinessChart = null;
let applicationChart = null;
let skillGapChart = null;


// ============================================================
// AUTH CHECK
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
// LOAD ANALYTICS
// ============================================================

const loadAnalytics = async () => {

    const errorMessage =
        document.getElementById("errorMessage");

    errorMessage.classList.add("hidden");


    try {

        const [
            readinessResponse,
            skillGapResponse,
            applicationResponse
        ] = await Promise.all([

            apiRequest(
                "/placement-dashboard/readiness"
            ),

            apiRequest(
                "/placement-dashboard/skill-gaps"
            ),

            apiRequest(
                "/placement-dashboard/application-summary"
            )

        ]);


        const dashboard =
            readinessResponse.dashboard;


        const skillGaps =
            skillGapResponse.skillGaps || [];


        const applications =
            applicationResponse.applicationSummary || {};


        // ----------------------------------------------------
        // Overview
        // ----------------------------------------------------

        document.getElementById(
            "totalStudents"
        ).textContent =
            dashboard.totalStudents ?? "--";


        document.getElementById(
            "verifiedProfiles"
        ).textContent =
            dashboard.verifiedProfiles ?? "--";


        document.getElementById(
            "assessedStudents"
        ).textContent =
            dashboard.assessedStudents ?? "--";


        document.getElementById(
            "averageReadiness"
        ).textContent =
            dashboard.averageReadinessScore !== null &&
            dashboard.averageReadinessScore !== undefined
                ? `${dashboard.averageReadinessScore}%`
                : "--";


        // ----------------------------------------------------
        // Readiness counts
        // ----------------------------------------------------

        const readiness =
            dashboard.readinessSummary || {};


        document.getElementById(
            "highlyReady"
        ).textContent =
            readiness.HIGHLY_READY || 0;


        document.getElementById(
            "moderatelyReady"
        ).textContent =
            readiness.MODERATELY_READY || 0;


        document.getElementById(
            "needsPreparation"
        ).textContent =
            readiness.NEEDS_PREPARATION || 0;


        document.getElementById(
            "notReady"
        ).textContent =
            readiness.NOT_READY || 0;


        document.getElementById(
            "notAssessed"
        ).textContent =
            readiness.NOT_ASSESSED || 0;


        // ----------------------------------------------------
        // Charts
        // ----------------------------------------------------

        renderReadinessChart(
            readiness
        );


        renderApplicationChart(
            applications
        );


        renderSkillGapChart(
            skillGaps
        );


    } catch (error) {

        console.error(
            "ANALYTICS ERROR:",
            error
        );


        errorMessage.textContent =
            error.message ||
            "Failed to load placement analytics.";


        errorMessage.classList.remove(
            "hidden"
        );

    }

};


// ============================================================
// READINESS CHART
// ============================================================

const renderReadinessChart = (
    readiness
) => {

    const canvas =
        document.getElementById(
            "readinessChart"
        );


    if (readinessChart) {

        readinessChart.destroy();

    }


    readinessChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: [
                        "Highly Ready",
                        "Moderately Ready",
                        "Needs Preparation",
                        "Not Ready",
                        "Not Assessed"
                    ],

                    datasets: [
                        {
                            data: [

                                readiness.HIGHLY_READY || 0,

                                readiness.MODERATELY_READY || 0,

                                readiness.NEEDS_PREPARATION || 0,

                                readiness.NOT_READY || 0,

                                readiness.NOT_ASSESSED || 0

                            ],

                            borderWidth: 2
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        }

                    }

                }

            }
        );

};


// ============================================================
// APPLICATION CHART
// ============================================================

const renderApplicationChart = (
    applications
) => {

    const canvas =
        document.getElementById(
            "applicationChart"
        );


    if (applicationChart) {

        applicationChart.destroy();

    }


    applicationChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: [
                        "Registered",
                        "Shortlisted",
                        "Assessment",
                        "Interview",
                        "Selected",
                        "Rejected"
                    ],

                    datasets: [
                        {
                            label: "Applications",

                            data: [

                                applications.REGISTERED || 0,

                                applications.SHORTLISTED || 0,

                                applications.ASSESSMENT || 0,

                                applications.INTERVIEW || 0,

                                applications.SELECTED || 0,

                                applications.REJECTED || 0

                            ],

                            borderWidth: 1
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    },

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

};


// ============================================================
// SKILL GAP CHART
// ============================================================

const renderSkillGapChart = (
    skillGaps
) => {

    const canvas =
        document.getElementById(
            "skillGapChart"
        );


    if (skillGapChart) {

        skillGapChart.destroy();

    }


    /*
      Display the top 8 most common gaps.
    */

    const topGaps =
        skillGaps
            .slice(0, 8);


    skillGapChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels:
                        topGaps.map(
                            item =>
                                item.skill
                        ),

                    datasets: [
                        {
                            label:
                                "Students Missing Skill",

                            data:
                                topGaps.map(
                                    item =>
                                        item.studentCount
                                ),

                            borderWidth: 1
                        }
                    ]

                },

                options: {

                    indexAxis: "y",

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        x: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    },

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

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
                loadAnalytics
            );


        document
            .getElementById("logoutButton")
            .addEventListener(
                "click",
                logout
            );


        loadAnalytics();

    }
);