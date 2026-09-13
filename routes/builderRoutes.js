const express = require("express");
const router = express.Router();
const builderController = require("../controllers/builderController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const { verifyWebsiteOwnership } = require("../middleware/ownership");

// ── [USER] Visual builder — every action scoped to the caller's own website ──
router.get("/builder/:id", requireAuth, verifyWebsiteOwnership(), builderController.getBuilder);

router.post("/builder/:id/add-component", requireAuth, verifyToken, verifyWebsiteOwnership(), builderController.addComponent);
router.post("/builder/:id/reorder-sections", requireAuth, verifyToken, verifyWebsiteOwnership(), builderController.reorderSections);
router.post("/builder/:id/duplicate-section", requireAuth, verifyToken, verifyWebsiteOwnership(), builderController.duplicateSection);
router.post("/builder/:id/delete-section", requireAuth, verifyToken, verifyWebsiteOwnership(), builderController.deleteSection);
router.post("/builder/:id/toggle-section", requireAuth, verifyToken, verifyWebsiteOwnership(), builderController.toggleSectionVisibility);
router.post("/builder/:id/update-content", requireAuth, verifyToken, verifyWebsiteOwnership(), builderController.updateSectionContent);
router.post("/builder/:id/update-styles", requireAuth, verifyToken, verifyWebsiteOwnership(), builderController.updateSectionStyles);
router.post("/builder/:id/apply-theme", requireAuth, verifyToken, verifyWebsiteOwnership(), builderController.applyTheme);

module.exports = router;