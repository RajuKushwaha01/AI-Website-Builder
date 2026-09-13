const slugify = require("slugify");
const Website = require("../models/Website");
const { runPromptWithFallback } = require("../services/aiService");
const {
  buildWebsiteGenerationPrompt,
  buildSectionPrompt,
  buildFaqPrompt,
  buildSeoPrompt,
  buildTextTransformPrompt,
  buildAiCommandPrompt
} = require("../utils/promptBuilder");
const { isValidSectionType } = require("../utils/componentSchema");
const { detectBackendNeeds } = require("../utils/backendDetector");
const websiteTypes = require("../utils/websiteTypes");

exports.getAiBuilder = (req, res) => {
  res.render("dashboard/ai-builder", {
    user: { name: req.session.userName },
    websiteTypes,
    error: null
  });
};

// STEP: full website generation
exports.generateWebsite = async (req, res) => {
  const { websiteType, businessName, description, pages, style, colorHint } = req.body;

  if (!websiteType || !businessName || !description) {
    return res.status(400).json({ success: false, message: "Website type, business name and description are required." });
  }

  const pageList = Array.isArray(pages) ? pages : (pages || "Home").split(",").map(p => p.trim());
  
  // Detect backend intent from the user description
  const backendNeeds = detectBackendNeeds(description);
  const backendSectionTypes = backendNeeds.flatMap((n) => n.sections);

  try {
    const prompt = buildWebsiteGenerationPrompt({
      websiteType,
      businessName,
      description,
      pages: pageList,
      style: style || "Modern",
      colorHint
    });

    const { provider, data } = await runPromptWithFallback(prompt, req.session.userId, undefined, "websiteGenerations");

    // Validate & sanitize sections against our allowed schema
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
        if (homePage.sections.some((s) => s.type === type)) return;
        const footerIndex = homePage.sections.findIndex((s) => s.type === "footer");
        const newSection = { type, content: {} };
        if (footerIndex !== -1) {
          homePage.sections.splice(footerIndex, 0, newSection);
        } else {
          homePage.sections.push(newSection);
        }
      });
    }

    const slug = slugify(businessName, { lower: true }) + "-" + Date.now().toString().slice(-5);

    const website = await Website.create({
      owner: req.session.userId,
      name: businessName,
      slug,
      description,
      websiteType,
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
      message: `Website generated successfully using ${provider}.${backendSummary}`,
      websiteId: website._id,
      redirect: `/websites/${website._id}/settings`,
      backendFeatures: backendNeeds.map((n) => n.label)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP: add a single page to an existing website
exports.addPage = async (req, res) => {
  const website = req.website;
  const { pageName } = req.body;

  try {
    const prompt = buildWebsiteGenerationPrompt({
      websiteType: website.websiteType,
      businessName: website.name,
      description: website.description,
      pages: [pageName],
      style: "Modern",
      colorHint: null
    });

    const { provider, data } = await runPromptWithFallback(prompt, req.session.userId, website._id, "contentGenerations");
    const newPage = data.pages?.[0];

    if (!newPage) throw new Error("AI did not return a valid page.");

    website.pages.push({
      name: newPage.name,
      slug: slugify(newPage.name, { lower: true }),
      isHome: false,
      sections: (newPage.sections || []).filter((s) => isValidSectionType(s.type))
    });

    website.lastAiProvider = provider;
    await website.save();

    res.json({ success: true, message: `"${pageName}" page added using ${provider}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP: add a single section to a page
exports.addSection = async (req, res) => {
  const website = req.website;
  const { pageId, sectionType } = req.body;

  if (!isValidSectionType(sectionType)) {
    return res.status(400).json({ success: false, message: "Invalid section type requested." });
  }

  try {
    const prompt = buildSectionPrompt(sectionType, `${website.name} — ${website.description}`);
    const { provider, data } = await runPromptWithFallback(prompt, req.session.userId, website._id, "contentGenerations");

    const page = website.pages.id(pageId);
    if (!page) return res.status(404).json({ success: false, message: "Page not found." });

    // Insert new section before the footer if one exists, else append
    const footerIndex = page.sections.findIndex((s) => s.type === "footer");
    const newSection = { type: sectionType, content: data.content || {} };

    if (footerIndex !== -1) {
      page.sections.splice(footerIndex, 0, newSection);
    } else {
      page.sections.push(newSection);
    }

    website.lastAiProvider = provider;
    await website.save();

    res.json({ success: true, message: `"${sectionType}" section added using ${provider}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP: FAQ generation
exports.generateFaq = async (req, res) => {
  const website = req.website;

  try {
    const prompt = buildFaqPrompt(website.websiteType, website.name);
    const { provider, data } = await runPromptWithFallback(prompt, req.session.userId, website._id, "contentGenerations");

    let page = website.pages.find((p) => p.isHome) || website.pages[0];
    if (!page) return res.status(400).json({ success: false, message: "Website has no pages yet." });

    page.sections.push({ type: "faq", content: data.content || {} });
    website.lastAiProvider = provider;
    await website.save();

    res.json({ success: true, message: `FAQ generated using ${provider}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP: SEO generation
exports.generateSeo = async (req, res) => {
  const website = req.website;

  try {
    const prompt = buildSeoPrompt(website.websiteType, website.name, website.description);
    const { provider, data } = await runPromptWithFallback(prompt, req.session.userId, website._id, "contentGenerations");

    website.seo = {
      title: data.title || website.seo.title,
      description: data.description || website.seo.description,
      keywords: data.keywords || website.seo.keywords,
      ogDescription: data.ogDescription || ""
    };
    website.lastAiProvider = provider;
    await website.save();

    res.json({ success: true, message: `SEO generated using ${provider}.`, seo: website.seo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP: text transform — improve/rewrite/shorten/etc
exports.transformText = async (req, res) => {
  const { text, action } = req.body;
  if (!text || !action) {
    return res.status(400).json({ success: false, message: "Text and action are required." });
  }

  try {
    const prompt = buildTextTransformPrompt(text, action);
    const { provider, data } = await runPromptWithFallback(prompt, req.session.userId, undefined, "contentGenerations");

    res.json({ success: true, result: data.result, provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP: AI design assistant chat command
exports.aiCommand = async (req, res) => {
  const website = req.website;
  const { command } = req.body;

  try {
    const prompt = buildAiCommandPrompt(command, website.colors);
    const { provider, data } = await runPromptWithFallback(prompt, req.session.userId, website._id, "aiEdits");

    let replyMessage = "I didn't understand that command.";

    if (data.action === "change_color" && data.payload) {
      website.colors = { ...website.colors.toObject?.() || website.colors, ...data.payload };
      replyMessage = "✨ Done! I updated your color theme.";
    } else if (data.action === "add_section" && data.payload?.type && isValidSectionType(data.payload.type)) {
      const homePage = website.pages.find((p) => p.isHome) || website.pages[0];
      if (homePage) {
        const footerIndex = homePage.sections.findIndex((s) => s.type === "footer");
        const newSection = { type: data.payload.type, content: {} };
        if (footerIndex !== -1) homePage.sections.splice(footerIndex, 0, newSection);
        else homePage.sections.push(newSection);
        replyMessage = `✨ Done! I added a ${data.payload.type} section.`;
      }
    } else if (data.action === "resize_section") {
      replyMessage = `✨ Noted — resizing "${data.payload?.type}" is applied in the visual editor.`;
    }

    website.lastAiProvider = provider;
    await website.save();

    res.json({ success: true, message: replyMessage, provider, action: data.action });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};