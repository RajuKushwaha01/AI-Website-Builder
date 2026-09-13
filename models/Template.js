const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // business, portfolio, restaurant, education
    thumbnail: { type: String, default: "" },
    structure: { type: mongoose.Schema.Types.Mixed, default: {} },
    isPremium: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);