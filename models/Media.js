const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website" },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    altText: { type: String, default: "" },
    type: { type: String, enum: ["image", "video", "document"], default: "image" },
    size: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", mediaSchema);