(() => {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const status = document.getElementById("formStatus");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fields = {
    fullName: {
      input: document.getElementById("fullName"),
      error: document.getElementById("fullNameError"),
      validate: (value) => (value.trim() ? "" : "Enter your full name."),
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("emailError"),
      validate: (value) => {
        if (!value.trim()) return "Enter your email address.";
        if (!emailPattern.test(value.trim())) return "Enter a valid email address.";
        return "";
      },
    },
    subject: {
      input: document.getElementById("subject"),
      error: document.getElementById("subjectError"),
      validate: (value) => (value.trim() ? "" : "Enter a subject."),
    },
    message: {
      input: document.getElementById("message"),
      error: document.getElementById("messageError"),
      validate: (value) => (value.trim() ? "" : "Enter a message."),
    },
  };

  const setFieldError = (field, message) => {
    if (!field.input || !field.error) return;
    field.error.textContent = message;
    field.input.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const validateField = (key) => {
    const field = fields[key];
    if (!field.input) return "";
    const message = field.validate(field.input.value);
    setFieldError(field, message);
    return message;
  };

  Object.keys(fields).forEach((key) => {
    const { input } = fields[key];
    if (!input) return;
    input.addEventListener("blur", () => validateField(key));
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") validateField(key);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const messages = Object.keys(fields).map((key) => validateField(key));
    const firstInvalidKey = Object.keys(fields).find((key, index) => messages[index]);

    if (firstInvalidKey) {
      if (status) status.textContent = "";
      fields[firstInvalidKey].input.focus();
      return;
    }

    if (status) status.textContent = "Message sent. Thanks for reaching out.";
    form.reset();
    Object.keys(fields).forEach((key) => setFieldError(fields[key], ""));
  });
})();
