const crypto = require("crypto");

// Lightweight session-based CSRF (avoids deprecated `csurf` package)
function generateToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

function verifyToken(req, res, next) {
  const tokenFromForm = req.body._csrf;
  if (!tokenFromForm || tokenFromForm !== req.session.csrfToken) {
    return res.status(403).render("errors/404", { message: "Invalid or expired session token." });
  }
  next();
}

module.exports = { generateToken, verifyToken };