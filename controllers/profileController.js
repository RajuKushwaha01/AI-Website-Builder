const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.session.userId).lean();
  res.render("dashboard/profile", { user, error: null, success: null });
};

exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.session.userId);
  const { name, username } = req.body;

  user.name = name || user.name;
  user.username = username || user.username;

  if (req.file) {
    user.profileImage = "/uploads/" + req.file.filename;
  }

  await user.save();
  req.session.userName = user.name;

  res.render("dashboard/profile", { user: user.toObject(), error: null, success: "Profile updated successfully." });
};

exports.changePassword = async (req, res) => {
  const user = await User.findById(req.session.userId);
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return res.render("dashboard/profile", { user: user.toObject(), error: "Current password is incorrect.", success: null });
  }

  if (newPassword !== confirmNewPassword) {
    return res.render("dashboard/profile", { user: user.toObject(), error: "New passwords do not match.", success: null });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.render("dashboard/profile", { user: user.toObject(), error: null, success: "Password changed successfully." });
};