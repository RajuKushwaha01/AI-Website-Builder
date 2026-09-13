const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const upload = require("../middleware/upload");
const { validateUploadedFile } = require("../middleware/uploadValidation");
const { verifyMediaOwnership } = require("../middleware/ownership");

router.get("/dashboard/media", requireAuth, mediaController.listMedia);

// FIXED ORDER: parse the multipart body FIRST (so _csrf is available),
// THEN verify CSRF, THEN validate the file, THEN run the controller.
router.post(
  "/media/upload",
  requireAuth,
  upload.handleUpload("file"),
  verifyToken,
  validateUploadedFile,
  mediaController.uploadMedia
);

router.post("/media/:id/delete", requireAuth, verifyToken, verifyMediaOwnership(), mediaController.deleteMedia);
router.post("/media/:id/rename", requireAuth, verifyToken, verifyMediaOwnership(), mediaController.renameMedia);
router.post("/media/:id/alt-text", requireAuth, verifyToken, verifyMediaOwnership(), mediaController.setAltText);

module.exports = router;