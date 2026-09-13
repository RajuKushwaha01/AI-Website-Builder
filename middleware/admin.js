const User = require("../models/User");

async function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const user = await User.findById(req.session.userId).lean();

  if (!user || user.role !== "admin") {
    return res.status(403).render("errors/404", { message: "You don't have permission to access this page." });
  }

  if (user.status === "blocked") {
    req.session.destroy(() => res.redirect("/login"));
    return;
  }

  req.adminUser = user;
  next();
}

module.exports = { requireAdmin };