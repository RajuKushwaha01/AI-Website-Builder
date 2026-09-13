const express = require("express");
const router = express.Router();
const navigationController = require("../controllers/navigationController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const { verifyWebsiteOwnership } = require("../middleware/ownership");

// ── [USER] Navigation manager — Section 29 ──
router.get("/websites/:id/navigation", requireAuth, verifyWebsiteOwnership(), navigationController.getNavigation);
router.post("/websites/:id/navigation", requireAuth, verifyToken, verifyWebsiteOwnership(), navigationController.saveNavigation);

module.exports = router;