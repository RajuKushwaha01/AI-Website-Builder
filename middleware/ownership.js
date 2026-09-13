const Website = require("../models/Website");
const Form = require("../models/Form");
const BlogPost = require("../models/BlogPost");
const Media = require("../models/Media");

// ── WEBSITE ownership ──────────────────────────────────────
// Attaches req.website ONLY if the logged-in user owns it.
// Any route using this can trust req.website — no further owner
// checks are needed downstream, and no user can ever touch a
// website that isn't theirs, regardless of what ID they pass.
function verifyWebsiteOwnership(paramName = "id") {
  return async function (req, res, next) {
    try {
      const website = await Website.findOne({
        _id: req.params[paramName],
        owner: req.session.userId
      });

      if (!website) {
        return res.status(404).json({
          success: false,
          message: "Website not found or you don't have access to it."
        });
      }

      req.website = website;
      next();
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid website ID." });
    }
  };
}

// ── FORM ownership ─────────────────────────────────────────
// A Form has no owner field directly — ownership is derived
// through its parent Website. This closes the gap where a user
// could otherwise view/edit/delete another user's form by ID.
function verifyFormOwnership(paramName = "id") {
  return async function (req, res, next) {
    try {
      const form = await Form.findById(req.params[paramName]);
      if (!form) {
        return res.status(404).json({ success: false, message: "Form not found." });
      }

      const website = await Website.findOne({ _id: form.website, owner: req.session.userId });
      if (!website) {
        return res.status(403).json({ success: false, message: "You don't have access to this form." });
      }

      req.form = form;
      req.website = website;
      next();
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid form ID." });
    }
  };
}

// Same idea, but for the "create form" / "list submissions" flows that
// start from a :websiteId param instead of a :formId.
function verifyWebsiteOwnershipForForms(req, res, next) {
  return verifyWebsiteOwnership("websiteId")(req, res, next);
}

// ── BLOG POST ownership ────────────────────────────────────
function verifyBlogPostOwnership(paramName = "id") {
  return async function (req, res, next) {
    try {
      const post = await BlogPost.findById(req.params[paramName]);
      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found." });
      }

      const website = await Website.findOne({ _id: post.website, owner: req.session.userId });
      if (!website) {
        return res.status(403).json({ success: false, message: "You don't have access to this post." });
      }

      req.blogPost = post;
      req.website = website;
      next();
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid post ID." });
    }
  };
}

// ── MEDIA ownership ─────────────────────────────────────────
// Media already stores `owner` directly, so this is a straight check,
// kept as its own middleware for consistency with everything above.
function verifyMediaOwnership(paramName = "id") {
  return async function (req, res, next) {
    try {
      const media = await Media.findOne({ _id: req.params[paramName], owner: req.session.userId });
      if (!media) {
        return res.status(404).json({ success: false, message: "Media not found or you don't have access to it." });
      }
      req.media = media;
      next();
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid media ID." });
    }
  };
}

module.exports = {
  verifyWebsiteOwnership,
  verifyFormOwnership,
  verifyWebsiteOwnershipForForms,
  verifyBlogPostOwnership,
  verifyMediaOwnership
};