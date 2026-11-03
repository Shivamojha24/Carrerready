// Handle student registration

const handleRegistration = async (event) => {

  event.preventDefault();

  const registerButton =
    document.getElementById("registerButton");

  const registerError =
    document.getElementById("registerError");

  const registerSuccess =
    document.getElementById("registerSuccess");


  const name =
    document.getElementById("name").value.trim();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;


  registerError.classList.add("hidden");
  registerSuccess.classList.add("hidden");


  if (password !== confirmPassword) {

    registerError.textContent =
      "Passwords do not match.";

    registerError.classList.remove("hidden");

    return;
  }


  registerButton.disabled = true;
  registerButton.textContent =
    "Creating account...";


  try {

    const data = await apiRequest(
      "/auth/register",
      {
        method: "POST",

        body: JSON.stringify({
          name,
          email,
          password
        })
      }
    );


    registerSuccess.textContent =
      "Account created successfully. Redirecting to login...";

    registerSuccess.classList.remove("hidden");


    setTimeout(() => {

      window.location.href =
        "./login.html";

    }, 1200);


  } catch (error) {

    registerError.textContent =
      error.message;

    registerError.classList.remove("hidden");

  } finally {

    registerButton.disabled = false;

    registerButton.textContent =
      "Create Student Account";

  }
};


document.addEventListener(
  "DOMContentLoaded",
  () => {

    const form =
      document.getElementById("registerForm");

    if (form) {

      form.addEventListener(
        "submit",
        handleRegistration
      );

    }

  }
);