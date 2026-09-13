const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    page: { type: mongoose.Schema.Types.ObjectId, ref: "Page", required: true },
    type: { type: String, required: true }, // hero, about, gallery, contact, etc.
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    styles: { type: mongoose.Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", sectionSchema);