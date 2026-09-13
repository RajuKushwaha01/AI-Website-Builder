const path = require("path");

// Extra defense on top of multer's fileFilter/limits (middleware/upload.js already
// restricts mimetype + extension + 5MB size). This layer re-checks the saved file
// and strips dangerous characters from filenames before anything references them.

function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .replace(/\.{2,}/g, ".") // block path traversal via "..".
    .slice(0, 100);
}

function validateUploadedFile(req, res, next) {
  if (!req.file) return next();

  const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const ext = path.extname(req.file.filename).toLowerCase();

  if (!allowedExt.includes(ext)) {
    return res.status(400).json({ success: false, message: "Unsupported file type." });
  }

  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: "File exceeds 5MB limit." });
  }

  req.file.originalname = sanitizeFilename(req.file.originalname);
  next();
}

module.exports = { validateUploadedFile, sanitizeFilename };