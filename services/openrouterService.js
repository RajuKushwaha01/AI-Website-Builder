const axios = require("axios");

async function callOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.2-3b-instruct:free";

  if (!key || key.includes("your_openrouter")) {
    throw new Error("OpenRouter API key not configured.");
  }

  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "NovaBuilder"
      },
      timeout: 20000
    }
  );

  const text = res.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned an empty response.");
  return text;
}

module.exports = { callOpenRouter };