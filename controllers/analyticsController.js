const Analytics = require("../models/Analytics");
const Website = require("../models/Website");

exports.getAnalytics = async (req, res) => {
  const websites = await Website.find({ owner: req.session.userId }).select("name slug").lean();
  const websiteId = req.query.website || websites[0]?._id;

  let records = [];
  let totals = { views: 0, visitors: 0, sessions: 0 };
  let topPages = [];
  let devices = {};
  let browsers = {};
  let referrers = {};

  if (websiteId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

    records = await Analytics.find({ website: websiteId, date: { $gte: cutoff } }).sort({ date: 1 }).lean();

    records.forEach((r) => {
      totals.views += r.views;
      totals.visitors += r.visitors;
      totals.sessions += r.visitors; // simple approximation: 1 session per unique daily visitor

      Object.entries(r.pages || {}).forEach(([page, count]) => {
        const existing = topPages.find((p) => p.page === page);
        if (existing) existing.count += count;
        else topPages.push({ page, count });
      });

      Object.entries(r.devices || {}).forEach(([k, v]) => (devices[k] = (devices[k] || 0) + v));
      Object.entries(r.browsers || {}).forEach(([k, v]) => (browsers[k] = (browsers[k] || 0) + v));
      Object.entries(r.referrers || {}).forEach(([k, v]) => (referrers[k] = (referrers[k] || 0) + v));
    });

    topPages.sort((a, b) => b.count - a.count);
  }

  res.render("dashboard/analytics", {
    user: { name: req.session.userName },
    websites,
    selectedWebsite: websiteId,
    records,
    totals,
    topPages: topPages.slice(0, 5),
    devices,
    browsers,
    referrers
  });
};