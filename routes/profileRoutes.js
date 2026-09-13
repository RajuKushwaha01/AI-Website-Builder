const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const upload = require("../middleware/upload");

router.get("/profile", requireAuth, profileController.getProfile);

// FIXED ORDER: Multer parses the multipart body BEFORE CSRF is checked.
router.post(
  "/profile",
  requireAuth,
  upload.handleUpload("profileImage"),
  verifyToken,
  profileController.updateProfile
);

router.post("/profile/change-password", requireAuth, verifyToken, profileController.changePassword);

module.exports = router;