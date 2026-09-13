const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    reduceAnimations: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);