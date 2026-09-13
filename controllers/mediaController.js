const Media = require("../models/Media");
const fs = require("fs");
const path = require("path");

exports.listMedia = async (req, res) => {
  const media = await Media.find({ owner: req.session.userId }).sort({ createdAt: -1 }).lean();
  res.render("dashboard/media", { user: { name: req.session.userName }, media });
};

exports.uploadMedia = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

  const media = await Media.create({
    owner: req.session.userId,
    website: req.body.websiteId || undefined,
    url: "/uploads/" + req.file.filename,
    filename: req.file.originalname,
    type: "image",
    size: req.file.size
  });

  res.json({ success: true, media });
};

exports.deleteMedia = async (req, res) => {
  const filePath = path.join(__dirname, "../public", req.media.url);
  fs.unlink(filePath, () => {}); // Best-effort delete from disk

  await req.media.deleteOne();
  res.json({ success: true });
};

exports.renameMedia = async (req, res) => {
  req.media.filename = req.body.filename;
  await req.media.save();
  res.json({ success: true });
};

exports.setAltText = async (req, res) => {
  req.media.altText = req.body.altText;
  await req.media.save();
  res.json({ success: true });
};