const AiGeneration = require("../models/AiGeneration");
const User = require("../models/User");

// Application-level policy (NOT provider limits) — Section 52.
const LIMITS = {
  free: { websiteGenerations: 10, contentGenerations: 30, aiEdits: 50 },
  pro: { websiteGenerations: 50, contentGenerations: 150, aiEdits: 250 }
};

// Classifies a request by its route path — the only reliable signal we have
// BEFORE the AI call is made (we can't classify by prompt content yet).
function classifyAction(originalUrl) {
  if (originalUrl.includes("/ai/generate-website") || originalUrl.includes("/create-website/generate")) {
    return "websiteGenerations";
  }
  if (
    originalUrl.includes("/add-page") ||
    originalUrl.includes("/add-section") ||
    originalUrl.includes("/generate-faq") ||
    originalUrl.includes("/generate-seo") ||
    originalUrl.includes("/transform-text")
  ) {
    return "contentGenerations";
  }
  return "aiEdits"; // /command and anything else AI-related
}

async function aiLimiter(req, res, next) {
  try {
    const user = await User.findById(req.session.userId).lean();
    const plan = user.plan === "pro" ? "pro" : "free";
    const action = classifyAction(req.originalUrl);
    const limit = LIMITS[plan][action];

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Each AiGeneration record already stores which website (if any) the call
    // was for, but not which "action bucket" — so we store it now going forward
    // via req.aiAction, and count today's records tagged with the same bucket.
    const usedForAction = await AiGeneration.countDocuments({
      user: user._id,
      actionType: action,
      createdAt: { $gte: startOfDay }
    });

    if (usedForAction >= limit) {
      return res.status(429).json({
        success: false,
        message: `You've reached your daily limit for this action (${limit}/day on the ${plan} plan). Try again tomorrow or upgrade.`
      });
    }

    req.aiUsage = { used: usedForAction, limit, action, plan };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not verify AI usage limit." });
  }
}

module.exports = aiLimiter;