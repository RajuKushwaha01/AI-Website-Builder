const User = require("../models/User");
const Website = require("../models/Website");
const Template = require("../models/Template");
const AiGeneration = require("../models/AiGeneration");
const Form = require("../models/Form");
const FormSubmission = require("../models/FormSubmission");

// ── DASHBOARD ──────────────────────────────────────────────

exports.getDashboard = async (req, res) => {
  const [userCount, websiteCount, publishedCount, aiTotal, aiFailed, formCount] = await Promise.all([
    User.countDocuments(),
    Website.countDocuments(),
    Website.countDocuments({ status: "published" }),
    AiGeneration.countDocuments(),
    AiGeneration.countDocuments({ success: false }),
    Form.countDocuments()
  ]);

  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();
  const recentWebsites = await Website.find().sort({ createdAt: -1 }).limit(5).populate("owner", "name").lean();

  res.render("admin/dashboard", {
    admin: req.adminUser,
    stats: { userCount, websiteCount, publishedCount, aiTotal, aiFailed, formCount },
    recentUsers,
    recentWebsites
  });
};

// ── USER MANAGEMENT (Section 47) ──────────────────────────

exports.listUsers = async (req, res) => {
  const search = req.query.q || "";
  const query = search
    ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }, { username: new RegExp(search, "i") }] }
    : {};

  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  res.render("admin/users", { admin: req.adminUser, users, search });
};

exports.blockUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "blocked" });
  res.json({ success: true });
};

exports.unblockUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "active" });
  res.json({ success: true });
};

exports.changeRole = async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role." });
  }
  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ success: true });
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  await Website.deleteMany({ owner: userId });
  await User.findByIdAndDelete(userId);
  res.json({ success: true });
};

// ── WEBSITE MANAGEMENT (Section 47) ───────────────────────

exports.listWebsites = async (req, res) => {
  const search = req.query.q || "";
  const query = search ? { name: new RegExp(search, "i") } : {};

  const websites = await Website.find(query).sort({ createdAt: -1 }).populate("owner", "name email").lean();
  res.render("admin/websites", { admin: req.adminUser, websites, search });
};

exports.disableWebsite = async (req, res) => {
  await Website.findByIdAndUpdate(req.params.id, { status: "archived" });
  res.json({ success: true });
};

exports.deleteWebsiteAdmin = async (req, res) => {
  await Website.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// ── TEMPLATE MANAGEMENT (Section 47) ──────────────────────

exports.listTemplates = async (req, res) => {
  const templates = await Template.find().sort({ createdAt: -1 }).lean();
  res.render("admin/templates", { admin: req.adminUser, templates });
};

exports.createTemplate = async (req, res) => {
  const { name, category, structure, isPremium } = req.body;
  const template = await Template.create({
    name, category,
    structure: JSON.parse(structure || "{}"),
    isPremium: !!isPremium
  });
  res.json({ success: true, template });
};

exports.deleteTemplate = async (req, res) => {
  await Template.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// ── AI USAGE MANAGEMENT (Section 47) ──────────────────────

exports.getAiUsage = async (req, res) => {
  const [total, byProvider, failed, recent] = await Promise.all([
    AiGeneration.countDocuments(),
    AiGeneration.aggregate([{ $group: { _id: "$provider", count: { $sum: 1 } } }]),
    AiGeneration.countDocuments({ success: false }),
    AiGeneration.find().sort({ createdAt: -1 }).limit(20).populate("user", "name email").lean()
  ]);

  const providerCounts = Object.fromEntries(byProvider.map((p) => [p._id, p.count]));

  res.render("admin/ai-usage", {
    admin: req.adminUser,
    stats: { total, failed, providerCounts },
    recent
  });
};

// ── FORMS OVERVIEW (Section 47) ───────────────────────────

exports.listAllForms = async (req, res) => {
  const forms = await Form.find().populate("website", "name").lean();
  const submissionCounts = await FormSubmission.aggregate([
    { $group: { _id: "$form", count: { $sum: 1 } } }
  ]);
  const countMap = Object.fromEntries(submissionCounts.map((s) => [String(s._id), s.count]));

  const formsWithCounts = forms.map((f) => ({ ...f, submissionCount: countMap[String(f._id)] || 0 }));

  res.render("admin/forms", { admin: req.adminUser, forms: formsWithCounts });
};

// ── REPORTS (Section 47) ──────────────────────────────────

exports.getReports = async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [newUsers30d, newWebsites30d, publishedByType] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Website.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Website.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$websiteType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  res.render("admin/reports", {
    admin: req.adminUser,
    newUsers30d,
    newWebsites30d,
    publishedByType
  });
};

// ── SECURITY OVERVIEW (Section 47 & 48) ───────────────────

exports.getSecurity = async (req, res) => {
  const blockedUsers = await User.countDocuments({ status: "blocked" });
  const failedAiAttempts = await AiGeneration.countDocuments({ success: false });
  const recentFailedAi = await AiGeneration.find({ success: false }).sort({ createdAt: -1 }).limit(10).populate("user", "name email").lean();

  res.render("admin/security", {
    admin: req.adminUser,
    blockedUsers,
    failedAiAttempts,
    recentFailedAi,
    envStatus: {
      gemini: !!(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your_gemini")),
      openrouter: !!(process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.includes("your_openrouter"))
    }
  });
};