const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true },
    email: { type: String, required: true, lowercase: true, trim: true }
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ website: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);