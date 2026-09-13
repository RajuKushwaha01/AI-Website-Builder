const Website = require("../models/Website");
const { trackPageView } = require("../middleware/analyticsTracker");
const { resolveNavigation } = require("../utils/navResolver");

exports.renderPublicSite = async (req, res) => {
  const { slug, pageSlug } = req.params;

  const website = await Website.findOne({ slug, status: "published" }).lean();
  if (!website || !website.publishedSnapshot) {
    return res.status(404).render("errors/404", { message: "This website is not published or does not exist." });
  }

  const snapshot = website.publishedSnapshot;
  const pages = snapshot.pages.filter((p) => !p.hidden);
  const page = pageSlug ? pages.find((p) => p.slug === pageSlug) : pages.find((p) => p.isHome) || pages[0];

  if (!page) return res.status(404).render("errors/404", { message: "Page not found." });

  trackPageView(website._id, req, "/" + (pageSlug || ""));

  const baseUrl = `/w/${website.slug}`;
  const navbarSection = page.sections.find((s) => s.type === "navbar");

  const navLinks = resolveNavigation({
    website: { navigation: snapshot.navigation || [] },
    pages,
    currentPage: page,
    baseUrl,
    isPreview: false,
    fallbackLabels: navbarSection?.content?.links || pages.map((p) => p.name)
  });

  res.render("public/site", {
    website: { ...website, ...snapshot },
    page,
    isPreview: false,
    navLinks,
    baseUrl
  });
};