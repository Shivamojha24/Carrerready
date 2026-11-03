// ============================================================
// CareerReady - Authentication
// ============================================================


// ------------------------------------------------------------
// Handle Login
// ------------------------------------------------------------

const handleLogin = async (event) => {
  event.preventDefault();

  const loginButton =
    document.getElementById("loginButton");

  const loginError =
    document.getElementById("loginError");

  const email =
    document.getElementById("email")
      .value
      .trim();

  const password =
    document.getElementById("password")
      .value;


  // Clear previous error
  loginError.classList.add("hidden");
  loginError.textContent = "";


  // Disable button
  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";


  try {

    // --------------------------------------------------------
    // Login API
    // --------------------------------------------------------

    const data =
      await window.apiRequest(
        "/auth/login",
        {
          method: "POST",

          body: JSON.stringify({
            email,
            password
          })
        }
      );


    // --------------------------------------------------------
    // Store authentication data
    // --------------------------------------------------------

    localStorage.setItem(
      "careerReadyToken",
      data.token
    );

    localStorage.setItem(
      "careerReadyUser",
      JSON.stringify(data.user)
    );


    // --------------------------------------------------------
    // Role-based redirect
    // Backend determines the role.
    // There is NO role selector on login.
    // --------------------------------------------------------

    if (
      data.user.role === "STUDENT"
    ) {

      window.location.href =
        "./student/dashboard.html";

      return;
    }


    if (
      data.user.role === "MENTOR"
    ) {

      window.location.href =
        "./mentor/dashboard.html";

      return;
    }


    if (
      data.user.role === "PLACEMENT"
    ) {

      window.location.href =
        "./placement/dashboard.html";

      return;
    }


    // Unknown role
    throw new Error(
      "Unknown account role"
    );


  } catch (error) {

    loginError.textContent =
      error.message ||
      "Login failed.";

    loginError.classList.remove(
      "hidden"
    );


  } finally {

    loginButton.disabled = false;

    loginButton.textContent =
      "Sign In";
  }
};


// ------------------------------------------------------------
// Attach Login Event
// ------------------------------------------------------------

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const loginForm =
      document.getElementById(
        "loginForm"
      );


    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        handleLogin
      );

    }

  }
);