const Website = require("../models/Website");

exports.updatePageSeo = async (req, res) => {
  const { pageId, title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage } = req.body;

  const website = await Website.findOne({ _id: req.params.id, owner: req.session.userId });
  if (!website) return res.status(404).json({ success: false, message: "Website not found." });

  const page = website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  page.seo = { title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage };
  await website.save();

  res.json({ success: true, message: "Page SEO updated." });
};

// Auto-generated sitemap.xml for the published site (Section 35)
exports.getSitemap = async (req, res) => {
  const website = await Website.findOne({ slug: req.params.slug, status: "published" }).lean();
  if (!website || !website.publishedSnapshot) return res.status(404).send("Not found");

  const baseUrl = `${req.protocol}://${req.get("host")}/w/${website.slug}`;
  const pages = website.publishedSnapshot.pages.filter((p) => !p.hidden);

  const urls = pages
    .map((p) => `
  <url>
    <loc>${baseUrl}${p.isHome ? "" : "/" + p.slug}</loc>
    <changefreq>weekly</changefreq>
  </url>`)
    .join("");

  res.set("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`);
};

// Auto-generated robots.txt for the published site
exports.getRobots = async (req, res) => {
  const website = await Website.findOne({ slug: req.params.slug }).lean();
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.set("Content-Type", "text/plain");
  res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/w/${website ? website.slug : ""}/sitemap.xml`);
};