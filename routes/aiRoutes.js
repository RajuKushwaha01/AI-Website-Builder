const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const aiLimiter = require("../middleware/aiLimiter");
const { verifyWebsiteOwnership } = require("../middleware/ownership");

// ── [USER] AI generation — website-scoped actions verify ownership first ──
router.get("/ai-builder", requireAuth, aiController.getAiBuilder);

router.post("/ai/generate-website", requireAuth, verifyToken, aiLimiter, aiController.generateWebsite);
router.post("/ai/websites/:id/add-page", requireAuth, verifyToken, aiLimiter, verifyWebsiteOwnership(), aiController.addPage);
router.post("/ai/websites/:id/add-section", requireAuth, verifyToken, aiLimiter, verifyWebsiteOwnership(), aiController.addSection);
router.post("/ai/websites/:id/generate-faq", requireAuth, verifyToken, aiLimiter, verifyWebsiteOwnership(), aiController.generateFaq);
router.post("/ai/websites/:id/generate-seo", requireAuth, verifyToken, aiLimiter, verifyWebsiteOwnership(), aiController.generateSeo);
router.post("/ai/transform-text", requireAuth, verifyToken, aiLimiter, aiController.transformText);
router.post("/ai/websites/:id/command", requireAuth, verifyToken, aiLimiter, verifyWebsiteOwnership(), aiController.aiCommand);

module.exports = router;