const { callGemini } = require("./geminiService");
const { callOpenRouter } = require("./openrouterService");
const AiGeneration = require("../models/AiGeneration");

function extractJson(rawText) {
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in AI response.");
  }

  const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonSlice);
  } catch (parseErr) {
    console.error("🔴 JSON parse failed. Raw AI text was:\n", rawText.slice(0, 1000));
    throw new Error(`AI returned invalid JSON: ${parseErr.message}`);
  }
}

async function runPromptWithFallback(prompt, userId, websiteId, actionType = "aiEdits") {
  const providers = [
    { name: "gemini", fn: callGemini },
    { name: "openrouter", fn: callOpenRouter }
  ];

  let lastError = null;

  for (const provider of providers) {
    try {
      const rawText = await provider.fn(prompt);
      const parsed = extractJson(rawText);

      await AiGeneration.create({
        user: userId,
        website: websiteId || undefined,
        prompt,
        provider: provider.name,
        actionType,
        response: parsed,
        success: true
      });

      return { provider: provider.name, data: parsed };
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ ${provider.name} failed: ${err.message}`);
    }
  }

  await AiGeneration.create({
    user: userId,
    website: websiteId || undefined,
    prompt,
    provider: "gemini",
    actionType,
    response: { error: lastError?.message },
    success: false
  });

  throw new Error(
    `Both AI providers failed. Last error: ${lastError?.message || "unknown error"}. ` +
    `Check your GEMINI_API_KEY / OPENROUTER_API_KEY in your .env file.`
  );
}

module.exports = { runPromptWithFallback };