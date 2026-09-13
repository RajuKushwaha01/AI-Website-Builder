const Website = require("../models/Website");
const Version = require("../models/Version");
const slugify = require("slugify");

exports.listWebsites = async (req, res) => {
  const websites = await Website.find({ owner: req.session.userId }).sort({ updatedAt: -1 }).lean();
  res.render("dashboard/websites", { user: { name: req.session.userName }, websites });
};

exports.createWebsite = async (req, res) => {
  try {
    const name = req.body.name || "Untitled Website";
    let slug = slugify(name, { lower: true }) + "-" + Date.now().toString().slice(-5);

    const website = await Website.create({ owner: req.session.userId, name, slug });
    res.redirect(`/websites/${website._id}/settings`);
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard/websites");
  }
};

exports.getSettings = async (req, res) => {
  const website = req.website.toObject();
  const versions = await Version.find({ website: website._id }).sort({ versionNumber: -1 }).lean();

  res.render("dashboard/website-settings", {
    user: { name: req.session.userName },
    website,
    versions
  });
};

exports.updateSettings = async (req, res) => {
  const website = req.website;

  const lastVersion = await Version.findOne({ website: website._id }).sort({ versionNumber: -1 });
  const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

  await Version.create({
    website: website._id,
    versionNumber: nextVersionNumber,
    snapshot: website.toObject(),
    label: `Autosave v${nextVersionNumber}`
  });

  const { name, description, seoTitle, seoDescription, seoKeywords, contactEmail, contactPhone, contactAddress,
    facebook, instagram, twitter, linkedin, primaryColor, secondaryColor, accentColor } = req.body;

  Object.assign(website, {
    name: name || website.name,
    description,
    seo: { title: seoTitle, description: seoDescription, keywords: seoKeywords },
    contactInfo: { email: contactEmail, phone: contactPhone, address: contactAddress },
    socialLinks: { facebook, instagram, twitter, linkedin },
    colors: { primary: primaryColor, secondary: secondaryColor, accent: accentColor },
    lastSavedAt: new Date()
  });

  await website.save();
  res.json({ success: true, message: "Saved ✓" });
};

exports.renameWebsite = async (req, res) => {
  req.website.name = req.body.name;
  await req.website.save();
  res.redirect("/dashboard/websites");
};

exports.duplicateWebsite = async (req, res) => {
  const original = req.website.toObject();
  delete original._id;
  original.name = original.name + " (Copy)";
  original.slug = slugify(original.name, { lower: true }) + "-" + Date.now().toString().slice(-5);
  original.status = "draft";
  original.publishedSnapshot = null;
  original.publishedAt = null;

  await Website.create(original);
  res.redirect("/dashboard/websites");
};

exports.deleteWebsite = async (req, res) => {
  await req.website.deleteOne();
  await Version.deleteMany({ website: req.params.id });
  res.redirect("/dashboard/websites");
};

exports.archiveWebsite = async (req, res) => {
  req.website.status = "archived";
  await req.website.save();
  res.redirect("/dashboard/websites");
};

exports.publishWebsite = async (req, res) => {
  req.website.status = "published";
  await req.website.save();
  res.redirect("/dashboard/websites");
};

exports.unpublishWebsite = async (req, res) => {
  req.website.status = "draft";
  await req.website.save();
  res.redirect("/dashboard/websites");
};

exports.restoreVersion = async (req, res) => {
  const version = await Version.findOne({ _id: req.params.versionId, website: req.params.id }).lean();
  if (!version) return res.redirect(`/websites/${req.params.id}/settings`);

  const snapshot = version.snapshot;
  delete snapshot._id;
  delete snapshot.__v;

  Object.assign(req.website, snapshot);
  await req.website.save();
  res.redirect(`/websites/${req.params.id}/settings`);
};

exports.deleteVersion = async (req, res) => {
  await Version.deleteOne({ _id: req.params.versionId, website: req.params.id });
  res.redirect(`/websites/${req.params.id}/settings`);
};

// ── PAGE MANAGER (Section 28) ──

exports.addPage = async (req, res) => {
  const { name } = req.body;
  const website = req.website;
  const slug = slugify(name, { lower: true }) + "-" + Date.now().toString().slice(-4);

  website.pages.push({
    name,
    slug,
    isHome: website.pages.length === 0,
    order: website.pages.length,
    sections: [
      { type: "navbar", content: { logoText: website.name, links: ["Home"] }, order: 0 },
      { type: "footer", content: { text: `© 2026 ${website.name}` }, order: 1 }
    ]
  });

  await website.save();
  const newPage = website.pages[website.pages.length - 1];
  res.json({ success: true, pageId: newPage._id, slug: newPage.slug });
};

exports.renamePage = async (req, res) => {
  const { pageId, name } = req.body;
  const page = req.website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  page.name = name;
  await req.website.save();
  res.json({ success: true });
};

exports.changePageSlug = async (req, res) => {
  const { pageId, slug } = req.body;
  const page = req.website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  page.slug = slugify(slug, { lower: true });
  await req.website.save();
  res.json({ success: true, slug: page.slug });
};

exports.duplicatePage = async (req, res) => {
  const { pageId } = req.body;
  const website = req.website;
  const page = website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  const clone = page.toObject();
  delete clone._id;
  clone.sections.forEach((s) => delete s._id);
  clone.name = clone.name + " (Copy)";
  clone.slug = slugify(clone.name, { lower: true }) + "-" + Date.now().toString().slice(-4);
  clone.isHome = false;
  clone.order = website.pages.length;

  website.pages.push(clone);
  await website.save();
  res.json({ success: true });
};

exports.deletePage = async (req, res) => {
  const { pageId } = req.body;
  const website = req.website;

  if (website.pages.length <= 1) {
    return res.status(400).json({ success: false, message: "A website must have at least one page." });
  }

  website.pages.pull(pageId);
  await website.save();
  res.json({ success: true });
};

exports.setHomePage = async (req, res) => {
  const { pageId } = req.body;
  const website = req.website;

  website.pages.forEach((p) => (p.isHome = String(p._id) === pageId));
  await website.save();
  res.json({ success: true });
};

exports.togglePageVisibility = async (req, res) => {
  const { pageId } = req.body;
  const page = req.website.pages.id(pageId);
  page.hidden = !page.hidden;
  await req.website.save();
  res.json({ success: true, hidden: page.hidden });
};