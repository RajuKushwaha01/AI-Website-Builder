const express = require("express");
const router = express.Router();
const websiteController = require("../controllers/websiteController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const { verifyWebsiteOwnership } = require("../middleware/ownership");

// ── [USER] Website CRUD — every route below is scoped to the caller's own websites ──
router.post("/websites/create", requireAuth, verifyToken, websiteController.createWebsite);

router.get("/websites/:id/settings", requireAuth, verifyWebsiteOwnership(), websiteController.getSettings);
router.post("/websites/:id/settings", requireAuth, verifyWebsiteOwnership(), websiteController.updateSettings);
router.post("/websites/:id/rename", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.renameWebsite);
router.post("/websites/:id/duplicate", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.duplicateWebsite);
router.post("/websites/:id/delete", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.deleteWebsite);
router.post("/websites/:id/archive", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.archiveWebsite);
router.post("/websites/:id/publish", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.publishWebsite);
router.post("/websites/:id/unpublish", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.unpublishWebsite);

router.post("/websites/:id/versions/:versionId/restore", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.restoreVersion);
router.post("/websites/:id/versions/:versionId/delete", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.deleteVersion);

// ── [USER] Page manager — Section 28 ──
router.post("/websites/:id/pages/add", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.addPage);
router.post("/websites/:id/pages/rename", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.renamePage);
router.post("/websites/:id/pages/change-slug", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.changePageSlug);
router.post("/websites/:id/pages/duplicate", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.duplicatePage);
router.post("/websites/:id/pages/delete", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.deletePage);
router.post("/websites/:id/pages/set-home", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.setHomePage);
router.post("/websites/:id/pages/toggle-visibility", requireAuth, verifyToken, verifyWebsiteOwnership(), websiteController.togglePageVisibility);

module.exports = router;