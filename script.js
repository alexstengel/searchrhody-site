// SearchRhody 2.0 — navigation, footer year, newsletter form UI, legacy inquiry notes.
// OPEN DECISION: newsletter provider is not chosen. Do not POST subscriber data anywhere.
const NEWSLETTER_ENDPOINT = ""; // open decision — leave empty until a provider is approved and tested

// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    });
  });
}

// Footer year
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

// Legacy Get Started query params (old inbound links)
const legacyNote = document.getElementById("legacy-interest");
if (legacyNote) {
  const interest = new URLSearchParams(window.location.search).get("interest") || "";
  if (interest) {
    legacyNote.hidden = false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
  const errorBox = form.querySelector(".form-errors");
  const success = form.querySelector(".form-success");
  const submitBtn = form.querySelector("[type='submit']");
  const emailInput = form.querySelector("input[name='email']");
  const emailError = form.querySelector(".email-error");
  const consent = form.querySelector("input[name='consent']");
  const consentError = form.querySelector(".consent-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormErrors();

    const website = form.elements.website && form.elements.website.value.trim();
    if (website) {
      showLocalSuccess();
      return;
    }

    const email = (emailInput && emailInput.value.trim()) || "";
    const issues = [];
    if (!email) {
      issues.push({ el: emailInput, err: emailError, message: "Please enter your email address." });
    } else if (!EMAIL_RE.test(email)) {
      issues.push({ el: emailInput, err: emailError, message: "Please enter a valid email address." });
    }
    if (!consent || !consent.checked) {
      issues.push({
        el: consent,
        err: consentError,
        message: "Please check the box if you’d like to receive The Rhody Roundup.",
      });
    }

    if (issues.length) {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = issues.length === 1
          ? issues[0].message
          : "Please fix the highlighted fields and try again.";
      }
      issues.forEach(({ el, err, message }) => {
        if (el) el.setAttribute("aria-invalid", "true");
        if (err) {
          err.hidden = false;
          err.textContent = message;
        }
      });
      const first = issues[0].el;
      if (first && first.focus) first.focus();
      return;
    }

    if (!NEWSLETTER_ENDPOINT) {
      showLocalSuccess();
      return;
    }

    // Provider hook is intentionally unused until a service is chosen and tested.
  });

  function clearFormErrors() {
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }
    [emailInput, consent].forEach((el) => {
      if (el) el.removeAttribute("aria-invalid");
    });
    [emailError, consentError].forEach((err) => {
      if (err) {
        err.hidden = true;
        err.textContent = "";
      }
    });
  }

  function showLocalSuccess() {
    form.querySelectorAll(".signup-fields, .form-note, [type='submit']").forEach((el) => {
      el.hidden = true;
    });
    if (success) {
      success.hidden = false;
      success.focus();
    }
    if (submitBtn) submitBtn.disabled = true;
  }

  if (emailInput) {
    emailInput.addEventListener("input", () => {
      if (emailError) {
        emailError.hidden = true;
        emailError.textContent = "";
      }
      emailInput.removeAttribute("aria-invalid");
    });
  }
  if (consent) {
    consent.addEventListener("change", () => {
      if (consentError) {
        consentError.hidden = true;
        consentError.textContent = "";
      }
      consent.removeAttribute("aria-invalid");
    });
  }
});
