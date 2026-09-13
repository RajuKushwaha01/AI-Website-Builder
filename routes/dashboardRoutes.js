const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const websiteController = require("../controllers/websiteController");
const { requireAuth } = require("../middleware/auth");

router.get("/dashboard", requireAuth, dashboardController.getDashboard);
router.get("/dashboard/websites", requireAuth, websiteController.listWebsites);

module.exports = router;