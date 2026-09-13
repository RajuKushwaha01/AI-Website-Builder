const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD, one doc per day per website
    views: { type: Number, default: 0 },
    visitors: { type: Number, default: 0 },
    pages: { type: mongoose.Schema.Types.Mixed, default: {} },     // { "/": 10, "/about": 3 }
    devices: { type: mongoose.Schema.Types.Mixed, default: {} },   // { desktop: 8, mobile: 5 }
    browsers: { type: mongoose.Schema.Types.Mixed, default: {} },  // { Chrome: 10, Safari: 3 }
    referrers: { type: mongoose.Schema.Types.Mixed, default: {} }, // { direct: 5, google: 8 }
    visitorIps: { type: [String], default: [] } // used only to count unique visitors per day
  },
  { timestamps: true }
);

analyticsSchema.index({ website: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Analytics", analyticsSchema);