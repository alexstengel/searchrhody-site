/* Example Cloudflare Worker for SearchRhody inquiries.
 * Not deployed. Do not put API keys in this file or in the static site.
 *
 * Once a free Resend account is created and a verified searchrhody.com
 * sending domain, deploy this Worker and store the key as the
 * RESEND_API_KEY secret. Then set FORM_ENDPOINT in get-started.js
 * to the Worker URL (one-line change).
 */

const OWNER = "getfound@searchrhody.com";
const FROM = "SearchRhody <getfound@searchrhody.com>";
const THANKS_PATH = "https://searchrhody.com/thanks.html";
const ALLOWED_ORIGINS = [
  "https://searchrhody.com",
  "https://www.searchrhody.com",
];

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
}

function firstName(name) {
  const word = String(name || "").trim().split(/\s+/)[0];
  return word || "there";
}

function confirmBody(name, business) {
  return [
    `Hi ${firstName(name)},`,
    "",
    `Thanks for getting in touch! We received your message and look forward to learning more about ${business}.`,
    "",
    "We'll take a look at the information you shared and get back to you within 1–2 business days.",
    "",
    "In the meantime, feel free to reply directly to this email if there's anything else you'd like us to know.",
    "",
    "Talk soon!",
    "",
    "The SearchRhody Team",
    "Local visibility, made simple.",
    "searchrhody.com",
  ].join("\n");
}

function ownerBody(data) {
  const help = Array.isArray(data.help) && data.help.length ? data.help.join("; ") : "(none selected)";
  return [
    "New SearchRhody inquiry",
    "",
    `Name: ${data.name}`,
    `Business: ${data.business}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "(not provided)"}`,
    `Help with: ${help}`,
    `Clicked from: ${data.interest || "(direct)"}`,
  ].join("\n");
}

async function readPayload(request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) return request.json();
  const form = await request.formData();
  return {
    name: String(form.get("name") || ""),
    business: String(form.get("business") || ""),
    email: String(form.get("email") || ""),
    phone: String(form.get("phone") || ""),
    help: form.getAll("help").map(String),
    interest: String(form.get("interest") || ""),
    website: String(form.get("website") || ""),
  };
}

function valid(data) {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return data.name && data.name.trim().length >= 2
    && data.business && data.business.trim().length >= 2
    && email.test(String(data.email || "").trim());
}

async function sendMail(apiKey, message) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("resend " + res.status + " " + text);
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = cors(origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers });

    let data;
    try {
      data = await readPayload(request);
    } catch {
      return Response.json({ ok: false, error: "bad-request" }, { status: 400, headers });
    }

    // Honeypot: pretend success, send nothing.
    if (data.website && String(data.website).trim()) {
      if ((request.headers.get("content-type") || "").includes("application/json")) {
        return Response.json({ ok: true }, { headers });
      }
      return Response.redirect(THANKS_PATH, 303);
    }

    if (!valid(data) || !env.RESEND_API_KEY) {
      return Response.json({ ok: false, error: "invalid" }, { status: 400, headers });
    }

    const name = data.name.trim();
    const business = data.business.trim();
    const email = data.email.trim();

    await sendMail(env.RESEND_API_KEY, {
      from: FROM,
      to: [OWNER],
      reply_to: email,
      subject: `New inquiry from ${name} (${business})`,
      text: ownerBody({ ...data, name, business, email }),
    });

    await sendMail(env.RESEND_API_KEY, {
      from: FROM,
      to: [email],
      reply_to: OWNER,
      subject: "Thanks for reaching out to SearchRhody!",
      text: confirmBody(name, business),
    });

    if ((request.headers.get("content-type") || "").includes("application/json")) {
      return Response.json({ ok: true }, { headers });
    }
    return Response.redirect(THANKS_PATH, 303);
  },
};
