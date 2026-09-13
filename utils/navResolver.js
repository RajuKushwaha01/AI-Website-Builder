// Resolves navbar link labels (or a saved navigation[] array) into real,
// clickable URLs — correctly scoped for either the live public site or preview mode.

function buildPageUrl(page, baseUrl, isPreview) {
  if (isPreview) return `${baseUrl}?page=${page._id}`;
  return page.isHome ? baseUrl : `${baseUrl}/${page.slug}`;
}

function resolveNavigation({ website, pages, currentPage, baseUrl, isPreview, fallbackLabels }) {
  // Prefer a manually-configured navigation menu (Section 29) if one exists;
  // otherwise fall back to matching the AI-generated navbar link labels to real pages.
  const navItems =
    website.navigation && website.navigation.length > 0
      ? website.navigation
      : (fallbackLabels || []).map((label) => ({ label, type: "page", pageSlug: null }));

  return navItems.map((item) => {
    let href = "#";
    let matchedPage = null;

    if (item.type === "external" && item.url) {
      href = item.url;
    } else {
      matchedPage = item.pageSlug
        ? pages.find((p) => p.slug === item.pageSlug)
        : pages.find((p) => (p.name || "").toLowerCase() === (item.label || "").toLowerCase());

      if (matchedPage) href = buildPageUrl(matchedPage, baseUrl, isPreview);
    }

    const isActive = matchedPage
      ? isPreview
        ? String(matchedPage._id) === String(currentPage._id)
        : matchedPage.slug === currentPage.slug
      : false;

    return { label: item.label, href, active: isActive, external: item.type === "external" };
  });
}

module.exports = { resolveNavigation, buildPageUrl };