const express = require("express");
const router = express.Router();
const publicSiteController = require("../controllers/publicSiteController");
const seoController = require("../controllers/seoController");

router.get("/w/:slug/sitemap.xml", seoController.getSitemap);
router.get("/w/:slug/robots.txt", seoController.getRobots);
router.get("/w/:slug", publicSiteController.renderPublicSite);
router.get("/w/:slug/:pageSlug", publicSiteController.renderPublicSite);

module.exports = router;