const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/admin");
const { verifyToken } = require("../middleware/csrf");

router.get("/admin", requireAdmin, adminController.getDashboard);

router.get("/admin/users", requireAdmin, adminController.listUsers);
router.post("/admin/users/:id/block", requireAdmin, verifyToken, adminController.blockUser);
router.post("/admin/users/:id/unblock", requireAdmin, verifyToken, adminController.unblockUser);
router.post("/admin/users/:id/role", requireAdmin, verifyToken, adminController.changeRole);
router.post("/admin/users/:id/delete", requireAdmin, verifyToken, adminController.deleteUser);

router.get("/admin/websites", requireAdmin, adminController.listWebsites);
router.post("/admin/websites/:id/disable", requireAdmin, verifyToken, adminController.disableWebsite);
router.post("/admin/websites/:id/delete", requireAdmin, verifyToken, adminController.deleteWebsiteAdmin);

router.get("/admin/templates", requireAdmin, adminController.listTemplates);
router.post("/admin/templates/create", requireAdmin, verifyToken, adminController.createTemplate);
router.post("/admin/templates/:id/delete", requireAdmin, verifyToken, adminController.deleteTemplate);

router.get("/admin/ai-usage", requireAdmin, adminController.getAiUsage);
router.get("/admin/forms", requireAdmin, adminController.listAllForms);
router.get("/admin/reports", requireAdmin, adminController.getReports);
router.get("/admin/security", requireAdmin, adminController.getSecurity);

module.exports = router;