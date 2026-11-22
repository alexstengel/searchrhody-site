/* SearchRhody Get Started form.
 * Endpoint is the Cloudflare Worker. Swap this one line if the Worker URL changes.
 */
const FORM_ENDPOINT = "https://searchrhody-form.searchrhody.workers.dev";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d().\s-]{7,}$/;

const form = document.getElementById("inquiry-form");
const success = document.getElementById("form-success");
const errorBox = document.getElementById("form-errors");
const submitBtn = document.getElementById("inquiry-submit");

if (form) {
  const params = new URLSearchParams(window.location.search);
  const interest = params.get("interest") || "";
  const interestField = document.getElementById("interest");
  if (interestField && interest) interestField.value = interest;

  // Preview helper: /get-started.html?preview=success shows the thank-you state.
  if (params.get("preview") === "success") {
    showSuccess();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validate()) return;

    if (form.elements.website && form.elements.website.value.trim()) {
      showSuccess();
      return;
    }

    const payload = collect();

    if (!FORM_ENDPOINT || FORM_ENDPOINT.includes("FORM_ENDPOINT_PLACEHOLDER")) {
      showFormError("This form isn't sending email yet — the inbox connection still needs a one-time setup. In the meantime, please email getfound@searchrhody.com.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("submit-failed");
      showSuccess();
    } catch (err) {
      showFormError('Something went wrong sending your message. Please try again, or email <a href="mailto:getfound@searchrhody.com">getfound@searchrhody.com</a>.');
      setPending(false);
    }
  });

  ["name", "business", "email", "phone"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => clearFieldError(id));
  });
}

function collect() {
  const help = [...form.querySelectorAll('input[name="help"]:checked')].map((el) => el.value);
  return {
    name: form.elements.name.value.trim(),
    business: form.elements.business.value.trim(),
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim(),
    help,
    interest: (form.elements.interest && form.elements.interest.value) || "",
    website: (form.elements.website && form.elements.website.value) || "",
  };
}

function validate() {
  clearErrors();
  const data = collect();
  const issues = [];

  if (!data.name || data.name.length < 2) {
    issues.push({ id: "name", message: "Please enter your name." });
  }
  if (!data.business || data.business.length < 2) {
    issues.push({ id: "business", message: "Please enter your business name." });
  }
  if (!data.email) {
    issues.push({ id: "email", message: "Please enter your email so we can get back to you." });
  } else if (!EMAIL_RE.test(data.email)) {
    issues.push({ id: "email", message: "Please enter a valid email address." });
  }
  if (data.phone && !PHONE_RE.test(data.phone)) {
    issues.push({ id: "phone", message: "Please enter a valid phone number, or leave this blank." });
  }

  if (!issues.length) return true;

  issues.forEach(({ id, message }) => {
    const input = document.getElementById(id);
    const err = document.getElementById(id + "-error");
    if (input) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", id + "-error");
    }
    if (err) {
      err.hidden = false;
      err.textContent = message;
    }
  });

  errorBox.hidden = false;
  errorBox.textContent = issues.length === 1
    ? issues[0].message
    : "Please fix the highlighted fields and try again.";
  const first = document.getElementById(issues[0].id);
  if (first) first.focus();
  return false;
}

function clearFieldError(id) {
  const input = document.getElementById(id);
  const err = document.getElementById(id + "-error");
  if (input) {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }
  if (err) {
    err.hidden = true;
    err.textContent = "";
  }
  if (errorBox && ![...form.querySelectorAll(".field-error")].some((el) => !el.hidden)) {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }
}

function clearErrors() {
  errorBox.hidden = true;
  errorBox.textContent = "";
  ["name", "business", "email", "phone"].forEach(clearFieldError);
}

function showFormError(message) {
  errorBox.hidden = false;
  errorBox.innerHTML = message;
  errorBox.focus?.();
}

function setPending(pending) {
  submitBtn.disabled = pending;
  submitBtn.textContent = pending ? "Sending…" : "Let’s Talk";
}

function showSuccess() {
  form.hidden = true;
  success.hidden = false;
  success.focus();
}
