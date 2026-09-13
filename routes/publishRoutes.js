const express = require("express");
const router = express.Router();
const publishController = require("../controllers/publishController");
const seoController = require("../controllers/seoController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const { verifyWebsiteOwnership } = require("../middleware/ownership");

// ── [USER] Publish/preview/SEO — scoped to the caller's own website ──
router.post("/websites/:id/publish-live", requireAuth, verifyToken, verifyWebsiteOwnership(), publishController.publishWebsite);
router.post("/websites/:id/unpublish-live", requireAuth, verifyToken, verifyWebsiteOwnership(), publishController.unpublishWebsite);
router.get("/websites/:id/preview-live", requireAuth, verifyWebsiteOwnership(), publishController.previewWebsite);
router.post("/websites/:id/pages/seo", requireAuth, verifyToken, verifyWebsiteOwnership(), seoController.updatePageSeo);

module.exports = router;