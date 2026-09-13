const slugify = require("slugify");
const Website = require("../models/Website");
const { runPromptWithFallback } = require("../services/aiService");
const { buildWebsiteGenerationPrompt } = require("../utils/promptBuilder");
const { isValidSectionType } = require("../utils/componentSchema");
const { detectBackendNeeds } = require("../utils/backendDetector");
const websiteTypes = require("../utils/websiteTypes");

// Step 1–2: user opens NovaBuilder, clicks "Create Website"
exports.getWizard = (req, res) => {
  res.render("dashboard/create-website", {
    user: { name: req.session.userName },
    websiteTypes
  });
};

// Step 3–6: AI asks what type of website, user describes it in one sentence,
// AI infers type/pages/style and generates Home/About/Skills/Projects/... + content/layout/colors/typography
exports.generateFromDescription = async (req, res) => {
  const { description } = req.body;

  if (!description || description.trim().length < 8) {
    return res.status(400).json({ success: false, message: "Please describe your website in a bit more detail." });
  }

  try {
    // Detect backend intent BEFORE calling the AI — this drives what we tell it to build,
    // and also what we auto-provision afterward (real DB collections + endpoints).
    const backendNeeds = detectBackendNeeds(description);
    const backendSectionTypes = backendNeeds.flatMap((n) => n.sections);

    const inferencePrompt = `
Output ONLY valid JSON, no markdown fences.
A user typed this one-sentence request for a new website: "${description}"

Infer the following and return JSON EXACTLY as:
{
  "websiteType": "one short category, e.g. Portfolio, Restaurant, Developer, Agency",
  "businessName": "a reasonable name inferred from the request, or a generic placeholder like 'My Website'",
  "pages": ["Home", "About", "..."],
  "style": "Modern | Minimal | Bold | Elegant",
  "colorHint": "a short color preference, e.g. 'Blue + White', or empty string if none implied"
}
`.trim();

    const { data: inferred } = await runPromptWithFallback(inferencePrompt, req.session.userId, undefined, "websiteGenerations");

    const prompt = buildWebsiteGenerationPrompt({
      websiteType: inferred.websiteType || "Business",
      businessName: inferred.businessName || "My Website",
      description,
      pages: inferred.pages && inferred.pages.length ? inferred.pages : ["Home", "About", "Contact"],
      style: inferred.style || "Modern",
      colorHint: inferred.colorHint || ""
    });

    const { provider, data } = await runPromptWithFallback(prompt, req.session.userId, undefined, "websiteGenerations");

    const safePages = (data.pages || []).map((page) => ({
      name: page.name,
      slug: slugify(page.name || "page", { lower: true }),
      isHome: !!page.isHome,
      sections: (page.sections || []).filter((s) => isValidSectionType(s.type))
    }));

    // Auto-inject detected backend sections onto the home page, before the footer,
    // if the AI didn't already include an equivalent section on its own.
    if (backendSectionTypes.length && safePages.length) {
      const homePage = safePages.find((p) => p.isHome) || safePages[0];
      backendSectionTypes.forEach((type) => {
        const alreadyPresent = homePage.sections.some((s) => s.type === type);
        if (alreadyPresent) return;
        const newSection = { type, content: {} };
        const footerIndex = homePage.sections.findIndex((s) => s.type === "footer");
        if (footerIndex !== -1) {
          homePage.sections.splice(footerIndex, 0, newSection);
        } else {
          homePage.sections.push(newSection);
        }
      });
    }

    const businessName = inferred.businessName || "My Website";
    const slug = slugify(businessName, { lower: true }) + "-" + Date.now().toString().slice(-5);

    const website = await Website.create({
      owner: req.session.userId,
      name: businessName,
      slug,
      description,
      websiteType: inferred.websiteType || "Business",
      status: "draft",
      colors: data.theme || undefined,
      seo: data.seo || undefined,
      pages: safePages,
      lastAiProvider: provider
    });

    const backendSummary = backendNeeds.length
      ? ` Backend features added: ${backendNeeds.map((n) => n.label).join(", ")}.`
      : "";

    res.json({
      success: true,
      message: `Your website was generated using ${provider}.${backendSummary}`,
      websiteId: website._id,
      redirect: `/builder/${website._id}`,
      backendFeatures: backendNeeds.map((n) => n.label)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};