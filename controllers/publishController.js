const Website = require("../models/Website");
const { resolveNavigation } = require("../utils/navResolver");

// Deep-clone editable fields into publishedSnapshot — this becomes the live site.
exports.publishWebsite = async (req, res) => {
  const website = req.website;

  // Validate: at least one page, and a home page must exist
  if (!website.pages.length) {
    return res.status(400).json({ success: false, message: "Add at least one page before publishing." });
  }
  if (!website.pages.some((p) => p.isHome)) {
    website.pages[0].isHome = true;
  }

  const snapshot = {
    name: website.name,
    slug: website.slug,
    logo: website.logo,
    favicon: website.favicon,
    colors: website.colors.toObject(),
    fonts: website.fonts.toObject(),
    seo: website.seo.toObject(),
    socialLinks: website.socialLinks.toObject(),
    contactInfo: website.contactInfo.toObject(),
    pages: website.pages.map((p) => p.toObject()),
    navigation: website.navigation.map((n) => n.toObject())
  };

  website.publishedSnapshot = snapshot;
  website.publishedAt = new Date();
  website.status = "published";

  await website.save();

  res.json({
    success: true,
    message: "Website published successfully!",
    publicUrl: `/w/${website.slug}`
  });
};

exports.unpublishWebsite = async (req, res) => {
  req.website.status = "draft";
  await req.website.save();

  res.json({ success: true, message: "Website unpublished." });
};

// "Preview" — always renders the current DRAFT, editor chrome stripped
exports.previewWebsite = async (req, res) => {
  const website = req.website.toObject();
  const pages = website.pages;

  const pageId = req.query.page;
  const page = pageId
    ? pages.find((p) => String(p._id) === pageId)
    : pages.find((p) => p.isHome) || pages[0];

  if (!page) return res.status(404).render("errors/404", { message: "Page not found." });

  const baseUrl = `/websites/${website._id}/preview-live`;
  const navbarSection = page.sections.find((s) => s.type === "navbar");

  const navLinks = resolveNavigation({
    website,
    pages,
    currentPage: page,
    baseUrl,
    isPreview: true,
    fallbackLabels: navbarSection?.content?.links || pages.map((p) => p.name)
  });

  res.render("public/site", { website, page, isPreview: true, navLinks, baseUrl });
};