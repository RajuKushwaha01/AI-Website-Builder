const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    styles: {
      fontFamily: String, fontSize: String, fontWeight: String, lineHeight: String,
      letterSpacing: String, textAlign: String, textColor: String, backgroundColor: String,
      width: String, height: String, margin: String, padding: String,
      borderRadius: String, boxShadow: String
    },
    order: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false }
  },
  { _id: true }
);

const pageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    isHome: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    sections: [sectionSchema],
    // Per-page SEO (Section 35)
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
      ogTitle: { type: String, default: "" },
      ogDescription: { type: String, default: "" },
      ogImage: { type: String, default: "" }
    }
  },
  { _id: true }
);

const navItemSchema = new mongoose.Schema(
  {
    label: String,
    type: { type: String, enum: ["page", "external"], default: "page" },
    pageSlug: String,
    url: String,
    order: { type: Number, default: 0 },
    children: [{ label: String, type: String, pageSlug: String, url: String }]
  },
  { _id: true }
);

const websiteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true }, // used in public URL: /w/:slug
    description: { type: String, default: "" },
    websiteType: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    language: { type: String, default: "en" },
    timezone: { type: String, default: "UTC" },
    theme: { type: String, default: "Modern" },
    fonts: { heading: { type: String, default: "Space Grotesk" }, body: { type: String, default: "Inter" } },
    colors: {
      primary: { type: String, default: "#6C5CE7" },
      secondary: { type: String, default: "#00C2FF" },
      accent: { type: String, default: "#FF4ECD" }
    },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: String, default: "" },
      ogDescription: { type: String, default: "" }
    },
    socialLinks: {
      facebook: { type: String, default: "" }, instagram: { type: String, default: "" },
      twitter: { type: String, default: "" }, linkedin: { type: String, default: "" }
    },
    contactInfo: {
      email: { type: String, default: "" }, phone: { type: String, default: "" }, address: { type: String, default: "" }
    },
    pages: [pageSchema],
    navigation: [navItemSchema],

    // Draft vs Live separation (Section 33) — publishing snapshots the draft into this field
    publishedSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    publishedAt: { type: Date, default: null },

    lastAiProvider: { type: String, default: "" },
    lastSavedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Website", websiteSchema);