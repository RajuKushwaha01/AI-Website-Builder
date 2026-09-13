const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { requireAuth } = require("../middleware/auth");

router.get("/dashboard/analytics", requireAuth, analyticsController.getAnalytics);

module.exports = router;