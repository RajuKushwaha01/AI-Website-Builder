const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] },
    author: { type: String, default: "" },
    featuredImage: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" }
    },
    publishedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

blogPostSchema.index({ website: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("BlogPost", blogPostSchema);