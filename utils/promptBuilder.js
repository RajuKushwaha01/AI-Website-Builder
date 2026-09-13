const { ALLOWED_SECTION_TYPES } = require("./componentSchema");

// Builds the strict JSON-only prompt sent to every AI provider.
// The AI is instructed to output ONLY JSON matching our schema —
// never raw HTML — so the Component Engine renders it safely.

function buildWebsiteGenerationPrompt({ websiteType, businessName, description, pages, style, colorHint }) {
  return `
You are a website content generator. Output ONLY valid JSON, no markdown fences, no explanations.

Generate content for a "${websiteType}" website named "${businessName}".
Business description: ${description}
Pages needed: ${pages.join(", ")}
Design style: ${style}
Color preference: ${colorHint || "any modern palette"}

Return JSON in EXACTLY this shape:
{
  "seo": { "title": "string", "description": "string", "keywords": "comma,separated" },
  "theme": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "pages": [
    {
      "name": "Home",
      "isHome": true,
      "sections": [
        { "type": "navbar", "content": { "logoText": "string", "links": ["Home","About"] } },
        { "type": "hero", "content": { "title": "string", "subtitle": "string", "buttonText": "string" } },
        { "type": "about", "content": { "heading": "string", "text": "string" } },
        { "type": "services", "content": { "heading": "string", "items": [{ "title": "string", "description": "string" }] } },
        { "type": "testimonials", "content": { "heading": "string", "items": [{ "name": "string", "quote": "string" }] } },
        { "type": "cta", "content": { "heading": "string", "buttonText": "string" } },
        { "type": "footer", "content": { "text": "string" } }
      ]
    }
  ]
}

Rules:
- "type" must be one of: ${ALLOWED_SECTION_TYPES.join(", ")}
- Every page must include a "navbar" as its first section and "footer" as its last.
- Keep text concise and realistic for the business described.
- Use only the pages requested: ${pages.join(", ")}.
- Output raw JSON only — nothing before or after it.
`.trim();
}

function buildSectionPrompt(sectionType, businessContext) {
  return `
You are a website content generator. Output ONLY valid JSON, no markdown fences.
Generate content for a "${sectionType}" section for this business: ${businessContext}

Return JSON EXACTLY as:
{ "type": "${sectionType}", "content": { ...appropriate fields for this section type... } }
`.trim();
}

function buildFaqPrompt(businessType, businessName) {
  return `
Output ONLY valid JSON, no markdown fences.
Generate 5 frequently asked questions and answers for a "${businessType}" business named "${businessName}".

Return JSON EXACTLY as:
{ "type": "faq", "content": { "heading": "Frequently Asked Questions", "items": [ { "question": "string", "answer": "string" } ] } }
`.trim();
}

function buildSeoPrompt(businessType, businessName, description) {
  return `
Output ONLY valid JSON, no markdown fences.
Generate SEO metadata for a "${businessType}" business named "${businessName}". Description: ${description}

Return JSON EXACTLY as:
{ "title": "string (max 60 chars)", "description": "string (max 155 chars)", "keywords": "comma,separated,keywords", "ogDescription": "string" }
`.trim();
}

function buildTextTransformPrompt(text, action) {
  const actionMap = {
    improve: "Improve the writing quality of this text while keeping the same meaning.",
    rewrite: "Rewrite this text differently while keeping the same meaning.",
    professional: "Rewrite this text in a professional business tone.",
    friendly: "Rewrite this text in a warm, friendly tone.",
    shorten: "Shorten this text while keeping the key message.",
    expand: "Expand this text with more detail.",
    seo: "Rewrite this text to be more SEO-friendly, naturally including relevant keywords.",
    translate: "Translate this text to Spanish."
  };

  const instruction = actionMap[action] || actionMap.improve;

  return `
Output ONLY valid JSON, no markdown fences.
${instruction}

Original text: "${text}"

Return JSON EXACTLY as:
{ "result": "string" }
`.trim();
}

function buildAiCommandPrompt(command, currentTheme) {
  return `
Output ONLY valid JSON, no markdown fences.
You control a website editor. The user gives a natural-language command. Convert it into ONE structured action.

Current theme: ${JSON.stringify(currentTheme)}
User command: "${command}"

Allowed actions: "change_color", "add_section", "resize_section", "unknown"

Return JSON EXACTLY as ONE of these shapes:
{ "action": "change_color", "payload": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" } }
{ "action": "add_section", "payload": { "type": "one of: ${require("./componentSchema").ALLOWED_SECTION_TYPES.join(", ")}" } }
{ "action": "resize_section", "payload": { "type": "hero", "size": "large" } }
{ "action": "unknown", "payload": {} }
`.trim();
}

module.exports = {
  buildWebsiteGenerationPrompt,
  buildSectionPrompt,
  buildFaqPrompt,
  buildSeoPrompt,
  buildTextTransformPrompt,
  buildAiCommandPrompt
};