const Website = require("../models/Website");

exports.getNavigation = async (req, res) => {
  const website = await Website.findOne({ _id: req.params.id, owner: req.session.userId }).lean();
  if (!website) return res.status(404).json({ success: false, message: "Website not found." });
  res.json({ success: true, navigation: website.navigation, pages: website.pages });
};

// Full replace — simplest reliable model for add/delete/reorder/dropdown in one call (Section 29)
exports.saveNavigation = async (req, res) => {
  const { navigation } = req.body;

  const website = await Website.findOne({ _id: req.params.id, owner: req.session.userId });
  if (!website) return res.status(404).json({ success: false, message: "Website not found." });

  website.navigation = navigation.map((item, i) => ({
    label: item.label,
    type: item.type || "page",
    pageSlug: item.pageSlug || "",
    url: item.url || "",
    order: i,
    children: item.children || []
  }));

  await website.save();
  res.json({ success: true });
};