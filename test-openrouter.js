require("dotenv").config();
const axios = require("axios");

async function test() {
  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";

  console.log("Testing model:", model);

  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [{ role: "user", content: "Say hello" }]
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "NovaBuilder"
        }
      }
    );
    console.log("✅ SUCCESS:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("❌ FAILED");
    console.log("Status:", err.response?.status);
    console.log("Data:", JSON.stringify(err.response?.data, null, 2));
  }
}

test();