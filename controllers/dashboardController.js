const User = require("../models/User");
const Website = require("../models/Website");
const AiGeneration = require("../models/AiGeneration");

exports.getDashboard = async (req, res) => {
  const user = await User.findById(req.session.userId).lean();

  const [websites, publishedCount, draftCount, aiCount] = await Promise.all([
    Website.find({ owner: user._id }).sort({ updatedAt: -1 }).limit(6).lean(),
    Website.countDocuments({ owner: user._id, status: "published" }),
    Website.countDocuments({ owner: user._id, status: "draft" }),
    AiGeneration.countDocuments({ user: user._id })
  ]);

  const totalCount = await Website.countDocuments({ owner: user._id });

  res.render("dashboard/index", {
    user,
    websites,
    stats: { total: totalCount, published: publishedCount, drafts: draftCount, aiGenerations: aiCount }
  });
};