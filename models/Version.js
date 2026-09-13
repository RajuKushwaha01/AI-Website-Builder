const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true },
    versionNumber: { type: Number, required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    label: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Version", versionSchema);