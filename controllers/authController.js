const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");

exports.getLogin = (req, res) => {
  res.render("auth/login", { error: null, old: {} });
};

exports.getRegister = (req, res) => {
  res.render("auth/register", { error: null, old: {} });
};

exports.getForgotPassword = (req, res) => {
  res.render("auth/forgot-password", { error: null, message: null });
};

exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("auth/register", { error: errors.array()[0].msg, old: req.body });
  }

  const { name, username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).render("auth/register", { error: "Passwords do not match.", old: req.body });
  }

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).render("auth/register", {
        error: "An account with this email or username already exists.",
        old: req.body
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const colors = ["#6C5CE7", "#00C2FF", "#FF4ECD", "#22C55E"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const user = await User.create({ name, username, email, password: hashed, avatarColor });

    req.session.userId = user._id;
    req.session.userName = user.name;
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).render("auth/register", { error: "Something went wrong. Try again.", old: req.body });
  }
};

exports.postLogin = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render("auth/login", { error: "Invalid email or password.", old: req.body });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).render("auth/login", { error: "Invalid email or password.", old: req.body });
    }

    req.session.userId = user._id;
    req.session.userName = user.name;

    if (rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
    }

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).render("auth/login", { error: "Something went wrong. Try again.", old: req.body });
  }
};

exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always show the same message (avoid leaking which emails exist)
  if (!user) {
    return res.render("auth/forgot-password", {
      error: null,
      message: "If that email exists, a reset link has been sent."
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 min
  await user.save();

  // In production: send an email with the reset link containing `token`.
  console.log(`🔑 Password reset link: http://localhost:${process.env.PORT}/reset-password/${token}`);

  res.render("auth/forgot-password", {
    error: null,
    message: "If that email exists, a reset link has been sent."
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};