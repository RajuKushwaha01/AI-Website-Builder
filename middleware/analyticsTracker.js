const Analytics = require("../models/Analytics");

function getDeviceType(userAgent = "") {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  return "desktop";
}

function getBrowser(userAgent = "") {
  if (/edg/i.test(userAgent)) return "Edge";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent)) return "Safari";
  if (/firefox/i.test(userAgent)) return "Firefox";
  return "Other";
}

function getReferrerLabel(referrer = "") {
  if (!referrer) return "direct";
  if (referrer.includes("google")) return "google";
  if (referrer.includes("facebook")) return "facebook";
  if (referrer.includes("instagram")) return "instagram";
  return "other";
}

// Call this whenever a public website page is viewed.
async function trackPageView(websiteId, req, pagePath) {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const device = getDeviceType(req.headers["user-agent"]);
    const browser = getBrowser(req.headers["user-agent"]);
    const referrer = getReferrerLabel(req.headers["referer"]);

    let doc = await Analytics.findOne({ website: websiteId, date: today });

    if (!doc) {
      doc = new Analytics({ website: websiteId, date: today });
    }

    doc.views += 1;
    doc.pages[pagePath] = (doc.pages[pagePath] || 0) + 1;
    doc.devices[device] = (doc.devices[device] || 0) + 1;
    doc.browsers[browser] = (doc.browsers[browser] || 0) + 1;
    doc.referrers[referrer] = (doc.referrers[referrer] || 0) + 1;

    if (!doc.visitorIps.includes(ip)) {
      doc.visitorIps.push(ip);
      doc.visitors += 1;
    }

    doc.markModified("pages");
    doc.markModified("devices");
    doc.markModified("browsers");
    doc.markModified("referrers");

    await doc.save();
  } catch (err) {
    console.error("Analytics tracking failed:", err.message);
    // never block page rendering because of analytics failure
  }
}

module.exports = { trackPageView };