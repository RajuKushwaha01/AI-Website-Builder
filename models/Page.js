const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, default: 0 },
    isHome: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Page", pageSchema);