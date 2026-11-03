// Validate registration input
const validateRegistration = ({ name, email, password }) => {
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      errors.push("Please provide a valid email address");
    }
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else {
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
  }

  return errors;
};

// Validate login input
const validateLogin = ({ email, password }) => {
  const errors = [];

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  }

  return errors;
};

module.exports = {
  validateRegistration,
  validateLogin
};