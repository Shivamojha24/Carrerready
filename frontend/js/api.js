
// CareerReady API configuration
// Works locally and on Railway using the same Express server
window.API_BASE_URL = `${window.location.origin}/api`;

// Get the JWT stored after login
window.getAuthToken = () => {
    return localStorage.getItem("careerReadyToken");
};

// Central API request helper
window.apiRequest = async (endpoint, options = {}) => {
    const token = window.getAuthToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    // Attach JWT to protected API requests
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${window.API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    let data;

    try {
        data = await response.json();
    } catch {
        data = {
            success: false,
            message: "Invalid server response"
        };
    }

    if (!response.ok) {
        throw new Error(
            data.message || "Request failed"
        );
    }

    return data;
};
