const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    partySize: { type: Number, default: 1 },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);