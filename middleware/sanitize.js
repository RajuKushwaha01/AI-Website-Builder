const sanitizeHtml = require("sanitize-html");

// Strict allow-list: strips ALL scripts, event handlers, iframes, and styles.
// This is what keeps AI-generated or user-typed text from ever becoming executable code
// (Section 49 — AI output only ever reaches the DOM as plain text/limited markup).
const SANITIZE_OPTIONS = {
  allowedTags: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
  disallowedTagsMode: "discard"
};

function sanitizeValue(value) {
  if (typeof value === "string") {
    return sanitizeHtml(value, SANITIZE_OPTIONS);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const clean = {};
    for (const key of Object.keys(value)) {
      // Reject keys starting with "$" or containing "." — classic NoSQL injection vector
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = sanitizeValue(value[key]);
    }
    return clean;
  }
  return value;
}

// Applies to every incoming request body — sanitizes user text before it ever
// reaches a controller, model, or gets rendered back into an EJS template.
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
}

// Sanitizes AI-generated JSON before it's saved — the same boundary the AI orchestrator
// already enforces via componentSchema.js, applied again here as defense-in-depth.
function sanitizeAiContent(content) {
  return sanitizeValue(content);
}

module.exports = { sanitizeBody, sanitizeAiContent };