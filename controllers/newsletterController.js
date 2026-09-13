const NewsletterSubscriber = require("../models/NewsletterSubscriber");
const Website = require("../models/Website");

exports.subscribe = async (req, res) => {
  const { websiteSlug, email } = req.body;

  const website = await Website.findOne({ slug: websiteSlug, status: "published" }).lean();
  if (!website) return res.status(404).json({ success: false, message: "Website not found." });

  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "Please enter a valid email." });
  }

  const existing = await NewsletterSubscriber.findOne({ website: website._id, email: email.toLowerCase() });
  if (existing) {
    return res.json({ success: true, message: "You're already subscribed!" });
  }

  await NewsletterSubscriber.create({ website: website._id, email: email.toLowerCase() });
  res.json({ success: true, message: "Thanks for subscribing!" });
};

exports.listSubscribers = async (req, res) => {
  const subscribers = await NewsletterSubscriber.find({ website: req.website._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, subscribers, count: subscribers.length });
};