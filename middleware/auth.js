const User = require("../models/User");

async function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const user = await User.findById(req.session.userId).lean();
  if (!user || user.status === "blocked") {
    req.session.destroy(() => res.redirect("/login"));
    return;
  }

  next();
}

function redirectIfAuth(req, res, next) {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  next();
}

module.exports = { requireAuth, redirectIfAuth };