const mongoose = require("mongoose");

// A "member" of a PUBLISHED website — e.g. a customer who signs up on
// a restaurant's site to save favorites, or a student on a course site.
// Completely separate from platform Users (who own/build websites).
const siteMemberSchema = new mongoose.Schema(
  {
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

siteMemberSchema.index({ website: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("SiteMember", siteMemberSchema);