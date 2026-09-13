const bcrypt = require("bcrypt");
const SiteMember = require("../models/SiteMember");
const Website = require("../models/Website");
const { setSiteMemberSession, clearSiteMemberSession } = require("../middleware/siteAuth");

exports.signup = async (req, res) => {
  const { websiteSlug, name, email, password } = req.body;

  const website = await Website.findOne({ slug: websiteSlug, status: "published" }).lean();
  if (!website) return res.status(404).json({ success: false, message: "Website not found." });

  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ success: false, message: "Name, email, and a password of at least 6 characters are required." });
  }

  const existing = await SiteMember.findOne({ website: website._id, email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: "An account with this email already exists." });
  }

  const hashed = await bcrypt.hash(password, 12);
  const member = await SiteMember.create({ website: website._id, name, email: email.toLowerCase(), password: hashed });

  setSiteMemberSession(req, String(website._id), { id: member._id, name: member.name, email: member.email });

  res.json({ success: true, message: `Welcome, ${member.name}!` });
};

exports.login = async (req, res) => {
  const { websiteSlug, email, password } = req.body;

  const website = await Website.findOne({ slug: websiteSlug, status: "published" }).lean();
  if (!website) return res.status(404).json({ success: false, message: "Website not found." });

  const member = await SiteMember.findOne({ website: website._id, email: (email || "").toLowerCase() });
  if (!member) return res.status(400).json({ success: false, message: "Invalid email or password." });

  const match = await bcrypt.compare(password, member.password);
  if (!match) return res.status(400).json({ success: false, message: "Invalid email or password." });

  setSiteMemberSession(req, String(website._id), { id: member._id, name: member.name, email: member.email });

  res.json({ success: true, message: `Welcome back, ${member.name}!` });
};

exports.logout = (req, res) => {
  const { websiteId } = req.body;
  clearSiteMemberSession(req, websiteId);
  res.json({ success: true });
};