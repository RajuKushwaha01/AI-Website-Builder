const componentLibrary = require("../utils/componentLibrary");
const themePresets = require("../utils/themePresets");

const ALLOWED_BUILDER_TYPES = [
  ...require("../utils/componentSchema").ALLOWED_SECTION_TYPES,
  "heading", "paragraph", "text", "image", "button", "icon", "video", "divider", "spacer"
];

exports.getBuilder = async (req, res) => {
  const website = req.website.toObject();
  const pageId = req.query.page || (website.pages.find((p) => p.isHome) || website.pages[0])?._id;
  const currentPage = website.pages.find((p) => String(p._id) === String(pageId)) || website.pages[0];

  res.render("builder/index", {
    user: { name: req.session.userName },
    website,
    currentPage,
    componentLibrary,
    themePresets: Object.keys(themePresets)
  });
};

exports.addComponent = async (req, res) => {
  const { pageId, type, atIndex } = req.body;

  if (!ALLOWED_BUILDER_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid component type." });
  }

  const website = req.website;
  const page = website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  const allComponents = [...componentLibrary.basic, ...componentLibrary.website];
  const def = allComponents.find((c) => c.type === type);

  const newSection = {
    type,
    content: def ? JSON.parse(JSON.stringify(def.defaultContent)) : {},
    order: page.sections.length,
    hidden: false
  };

  const index = typeof atIndex === "number" ? atIndex : page.sections.length;
  page.sections.splice(index, 0, newSection);

  page.sections.forEach((s, i) => (s.order = i));
  website.lastSavedAt = new Date();
  await website.save();

  res.json({ success: true, section: newSection, sectionId: page.sections[index]._id });
};

exports.reorderSections = async (req, res) => {
  const { pageId, orderedIds } = req.body;

  const website = req.website;
  const page = website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  const map = new Map(page.sections.map((s) => [String(s._id), s]));
  const reordered = orderedIds.map((id) => map.get(id)).filter(Boolean);

  reordered.forEach((s, i) => (s.order = i));
  page.sections = reordered;

  website.lastSavedAt = new Date();
  await website.save();

  res.json({ success: true });
};

exports.duplicateSection = async (req, res) => {
  const { pageId, sectionId } = req.body;

  const website = req.website;
  const page = website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  const section = page.sections.id(sectionId);
  if (!section) return res.status(404).json({ success: false, message: "Section not found." });

  const clone = section.toObject();
  delete clone._id;

  const index = page.sections.findIndex((s) => String(s._id) === sectionId);
  page.sections.splice(index + 1, 0, clone);
  page.sections.forEach((s, i) => (s.order = i));

  await website.save();
  res.json({ success: true });
};

exports.deleteSection = async (req, res) => {
  const { pageId, sectionId } = req.body;

  const website = req.website;
  const page = website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  page.sections.pull(sectionId);
  page.sections.forEach((s, i) => (s.order = i));

  await website.save();
  res.json({ success: true });
};

exports.toggleSectionVisibility = async (req, res) => {
  const { pageId, sectionId } = req.body;

  const website = req.website;
  const page = website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  const section = page.sections.id(sectionId);
  if (!section) return res.status(404).json({ success: false, message: "Section not found." });

  section.hidden = !section.hidden;

  await website.save();
  res.json({ success: true, hidden: section.hidden });
};

exports.updateSectionContent = async (req, res) => {
  const { pageId, sectionId, content } = req.body;

  const website = req.website;
  const page = website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  const section = page.sections.id(sectionId);
  if (!section) return res.status(404).json({ success: false, message: "Section not found." });

  section.content = { ...section.content, ...content };
  website.lastSavedAt = new Date();
  await website.save();

  res.json({ success: true });
};

exports.updateSectionStyles = async (req, res) => {
  const { pageId, sectionId, styles } = req.body;

  const website = req.website;
  const page = website.pages.id(pageId);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  const section = page.sections.id(sectionId);
  if (!section) return res.status(404).json({ success: false, message: "Section not found." });

  Object.assign(section.styles, styles);
  website.lastSavedAt = new Date();
  await website.save();

  res.json({ success: true, styles: section.styles });
};

exports.applyTheme = async (req, res) => {
  const { themeName } = req.body;
  const preset = themePresets[themeName];

  if (!preset) return res.status(400).json({ success: false, message: "Unknown theme." });

  req.website.colors = preset;
  req.website.theme = themeName;
  await req.website.save();

  res.json({ success: true, colors: preset });
};