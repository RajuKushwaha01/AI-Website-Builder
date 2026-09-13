const express = require("express");
const router = express.Router();
const wizardController = require("../controllers/wizardController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const aiLimiter = require("../middleware/aiLimiter");

router.get("/create-website", requireAuth, wizardController.getWizard);
router.post("/create-website/generate", requireAuth, verifyToken, aiLimiter, wizardController.generateFromDescription);

module.exports = router;