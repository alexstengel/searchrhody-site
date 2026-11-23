// Preview mode (?preview=1 or preview.html) reveals mockups hidden on the public site.
try {
  if (new URLSearchParams(window.location.search).get("preview") === "1") {
    document.documentElement.classList.add("is-preview");
  }
} catch (e) {}

// SearchRhody 2.0 — navigation, footer year, newsletter form, legacy inquiry notes.
// Newsletter signups post to Buttondown as a normal form (not fetch), so confirmation
// and any CAPTCHA can complete. See https://docs.buttondown.com/building-your-subscriber-base
const NEWSLETTER_ENDPOINT = "https://buttondown.com/api/emails/embed-subscribe/searchrhody";

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

function ensureButtondownFrame() {
  let iframe = document.getElementById("buttondown-frame");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "buttondown-frame";
    iframe.name = "buttondown-frame";
    iframe.title = "Newsletter signup";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);border:0;";
    document.body.appendChild(iframe);
  }
  return iframe;
}

document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
  const errorBox = form.querySelector(".form-errors");
  const success = form.querySelector(".form-success");
  const submitBtn = form.querySelector("[type='submit']");
  const emailInput = form.querySelector("input[name='email']");
  const emailError = form.querySelector(".email-error");
  const consent = form.querySelector("input[name='consent']");
  const consentError = form.querySelector(".consent-error");
  const honeypot = form.querySelector("input[name='website']");

  // JS users get our accessible errors; no-JS users keep native required checks (including consent).
  form.noValidate = true;
  form.action = NEWSLETTER_ENDPOINT;
  form.method = "post";

  let finished = false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (finished) return;
    clearFormErrors();

    if (honeypot && honeypot.value.trim()) {
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

    // Post as a normal form into a hidden iframe so we can stay on this page
    // and show the success state. Don't use fetch (Buttondown may need a redirect).
    const iframe = ensureButtondownFrame();
    form.target = "buttondown-frame";
    // Don't send the honeypot or consent checkbox to Buttondown.
    if (honeypot) honeypot.disabled = true;
    if (consent) consent.disabled = true;

    const done = () => showLocalSuccess();
    iframe.addEventListener("load", done, { once: true });
    window.setTimeout(done, 2000);
    form.submit();
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
    if (finished) return;
    finished = true;
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
