const slugify = require("slugify");
const BlogPost = require("../models/BlogPost");
const Website = require("../models/Website");

exports.listPosts = async (req, res) => {
  const website = req.website.toObject ? req.website.toObject() : req.website;
  const posts = await BlogPost.find({ website: website._id }).sort({ createdAt: -1 }).lean();
  
  res.render("dashboard/blog", { user: { name: req.session.userName }, website, posts });
};

exports.createPost = async (req, res) => {
  const { websiteId, title, content, excerpt, category, tags, author, featuredImage } = req.body;

  // Verify website ownership from body parameter
  const website = await Website.findOne({ _id: websiteId, owner: req.session.userId });
  if (!website) return res.status(403).json({ success: false, message: "You don't have access to this website." });

  const slug = slugify(title, { lower: true }) + "-" + Date.now().toString().slice(-5);

  const post = await BlogPost.create({
    website: websiteId,
    title,
    slug,
    content,
    excerpt,
    category: category || "General",
    tags: (tags || "").split(",").map((t) => t.trim()).filter(Boolean),
    author,
    featuredImage,
    status: "draft"
  });

  res.json({ success: true, postId: post._id });
};

exports.updatePost = async (req, res) => {
  const { title, content, excerpt, category, tags, author, featuredImage, seoTitle, seoDescription } = req.body;
  const post = req.blogPost; // Ownership verified by middleware

  Object.assign(post, {
    title,
    content,
    excerpt,
    category: category || post.category,
    tags: (tags || "").split(",").map((t) => t.trim()).filter(Boolean),
    author,
    featuredImage,
    seo: { title: seoTitle, description: seoDescription }
  });

  await post.save();
  res.json({ success: true, message: "Post updated." });
};

exports.publishPost = async (req, res) => {
  req.blogPost.status = "published";
  req.blogPost.publishedAt = new Date();
  await req.blogPost.save();
  res.json({ success: true });
};

exports.unpublishPost = async (req, res) => {
  req.blogPost.status = "draft";
  await req.blogPost.save();
  res.json({ success: true });
};

exports.deletePost = async (req, res) => {
  await req.blogPost.deleteOne();
  res.json({ success: true });
};