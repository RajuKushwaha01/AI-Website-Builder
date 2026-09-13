const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const {
  verifyWebsiteOwnership,
  verifyBlogPostOwnership
} = require("../middleware/ownership");

// ── [USER] Blog — scoped through the parent website ──
router.get("/websites/:websiteId/blog", requireAuth, verifyWebsiteOwnership("websiteId"), blogController.listPosts);
router.post("/blog/create", requireAuth, verifyToken, blogController.createPost); // websiteId in body, checked inside
router.post("/blog/:id/update", requireAuth, verifyToken, verifyBlogPostOwnership(), blogController.updatePost);
router.post("/blog/:id/publish", requireAuth, verifyToken, verifyBlogPostOwnership(), blogController.publishPost);
router.post("/blog/:id/unpublish", requireAuth, verifyToken, verifyBlogPostOwnership(), blogController.unpublishPost);
router.post("/blog/:id/delete", requireAuth, verifyToken, verifyBlogPostOwnership(), blogController.deletePost);

module.exports = router;