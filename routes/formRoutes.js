const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");
const { requireAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/csrf");
const { generalLimiter } = require("../middleware/security");
const {
  verifyWebsiteOwnership,
  verifyFormOwnership
} = require("../middleware/ownership");

// ── [USER] Forms — list only shows the caller's own websites' forms ──
router.get("/dashboard/forms", requireAuth, formController.listForms);

// Creating/editing a form starts from a website → verify that website is the caller's
router.get("/websites/:websiteId/forms/new", requireAuth, verifyWebsiteOwnership("websiteId"), formController.getFormBuilder);
router.get("/websites/:websiteId/forms/:formId/edit", requireAuth, verifyWebsiteOwnership("websiteId"), formController.getFormBuilder);
router.post("/forms/save", requireAuth, verifyToken, formController.saveForm); // ownership re-checked inside (websiteId is in body, not params)

// Everything below acts on an existing form → verify via the form's parent website
router.post("/forms/:id/delete", requireAuth, verifyToken, verifyFormOwnership(), formController.deleteForm);
router.get("/forms/:formId/submissions", requireAuth, verifyFormOwnership("formId"), formController.viewSubmissions);
router.post("/submissions/:id/read", requireAuth, verifyToken, formController.markSubmissionRead); // submission ownership checked inside
router.post("/submissions/:id/delete", requireAuth, verifyToken, formController.deleteSubmission); // submission ownership checked inside

// ── [PUBLIC] anyone visiting a live site can submit — no auth, rate-limited ──
router.post("/public/forms/:formId/submit", generalLimiter, formController.submitForm);

module.exports = router;