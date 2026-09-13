const axios = require("axios");

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  if (!key || key.includes("your_gemini")) {
    throw new Error("Gemini API key not configured.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  try {
    const res = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      },
      { timeout: 60000 } // increased from 30000 — full website-generation prompts + thinking overhead need more headroom
    );

    const candidate = res.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      const finishReason = candidate?.finishReason || "UNKNOWN";
      throw new Error(`Gemini returned no text (finishReason: ${finishReason}).`);
    }

    return text;
  } catch (err) {
    if (err.response?.data) {
      console.error("🔴 Gemini API error body:", JSON.stringify(err.response.data, null, 2));
    }
    throw err;
  }
}

module.exports = { callGemini };