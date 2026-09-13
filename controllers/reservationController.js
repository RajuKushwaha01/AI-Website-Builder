const Reservation = require("../models/Reservation");
const Website = require("../models/Website");

exports.createReservation = async (req, res) => {
  const { websiteSlug, name, email, phone, date, time, partySize, notes } = req.body;

  const website = await Website.findOne({ slug: websiteSlug, status: "published" }).lean();
  if (!website) return res.status(404).json({ success: false, message: "Website not found." });

  if (!name || !email || !date || !time) {
    return res.status(400).json({ success: false, message: "Name, email, date, and time are required." });
  }

  await Reservation.create({
    website: website._id, name, email, phone,
    date, time, partySize: partySize || 1, notes
  });

  res.json({ success: true, message: "Your reservation request has been received! We'll confirm shortly." });
};

// Owner-facing: list reservations for a website they own
exports.listReservations = async (req, res) => {
  const reservations = await Reservation.find({ website: req.website._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, reservations });
};

exports.updateReservationStatus = async (req, res) => {
  const { status } = req.body;
  const reservation = await Reservation.findOne({ _id: req.params.id, website: req.website._id });
  if (!reservation) return res.status(404).json({ success: false, message: "Reservation not found." });

  reservation.status = status;
  await reservation.save();
  res.json({ success: true });
};