// Visitor sessions on a published site are stored under req.session.siteMembers,
// keyed by website ID — so a person can be logged into member areas on
// MULTIPLE different published NovaBuilder sites simultaneously, and it never
// touches or conflicts with req.session.userId (the platform account session).

function getSiteMemberSession(req, websiteId) {
  if (!req.session.siteMembers) return null;
  return req.session.siteMembers[websiteId] || null;
}

function setSiteMemberSession(req, websiteId, memberData) {
  if (!req.session.siteMembers) req.session.siteMembers = {};
  req.session.siteMembers[websiteId] = memberData;
}

function clearSiteMemberSession(req, websiteId) {
  if (req.session.siteMembers) delete req.session.siteMembers[websiteId];
}

module.exports = { getSiteMemberSession, setSiteMemberSession, clearSiteMemberSession };