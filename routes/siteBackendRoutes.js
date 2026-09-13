const express = require("express");
const router = express.Router();
const siteAuthController = require("../controllers/siteAuthController");
const reservationController = require("../controllers/reservationController");
const newsletterController = require("../controllers/newsletterController");
const { generalLimiter } = require("../middleware/security");
const { requireAuth } = require("../middleware/auth");
const { verifyWebsiteOwnership } = require("../middleware/ownership");

// ── [PUBLIC] Visitor-facing backend actions on a published website ──
// All rate-limited since they're unauthenticated and open to the internet.
router.post("/site-backend/signup", generalLimiter, siteAuthController.signup);
router.post("/site-backend/login", generalLimiter, siteAuthController.login);
router.post("/site-backend/logout", siteAuthController.logout);
router.post("/site-backend/reserve", generalLimiter, reservationController.createReservation);
router.post("/site-backend/subscribe", generalLimiter, newsletterController.subscribe);

// ── [USER] Website-owner views of their own backend data ──
router.get("/websites/:id/reservations", requireAuth, verifyWebsiteOwnership(), reservationController.listReservations);
router.post("/websites/:id/reservations/:resId/status", requireAuth, verifyWebsiteOwnership(), reservationController.updateReservationStatus);
router.get("/websites/:id/subscribers", requireAuth, verifyWebsiteOwnership(), newsletterController.listSubscribers);

module.exports = router;