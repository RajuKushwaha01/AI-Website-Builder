const mongoose = require("mongoose");

const aiGenerationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website" },
    prompt: { type: String, required: true },
    provider: { type: String, enum: ["gemini", "openrouter"], required: true },
    actionType: { type: String, enum: ["websiteGenerations", "contentGenerations", "aiEdits"], default: "aiEdits" },
    response: { type: mongoose.Schema.Types.Mixed, default: {} },
    success: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiGeneration", aiGenerationSchema);