const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { redirectIfAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/security");
const { verifyToken } = require("../middleware/csrf");

router.get("/login", redirectIfAuth, authController.getLogin);
router.get("/register", redirectIfAuth, authController.getRegister);
router.get("/forgot-password", redirectIfAuth, authController.getForgotPassword);

router.post(
  "/register",
  authLimiter,
  verifyToken,
  [
    body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters."),
    body("username").trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage("Username must be 3-30 characters (letters, numbers, underscore only)."),
    body("email").isEmail().normalizeEmail().withMessage("Enter a valid email."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
  ],
  authController.postRegister
);

router.post("/login", authLimiter, verifyToken, authController.postLogin);
router.post("/forgot-password", authLimiter, verifyToken, authController.postForgotPassword);
router.get("/logout", authController.logout);

module.exports = router;