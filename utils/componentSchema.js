const ALLOWED_SECTION_TYPES = [
  "navbar", "hero", "about", "services", "gallery",
  "testimonials", "pricing", "faq", "team", "stats",
  "cta", "contact", "footer", "form",
  "login", "signup", "booking", "newsletter" // NEW — real backend-connected sections
];

const ALLOWED_PAGE_NAMES = [
  "Home", "About", "Services", "Menu", "Gallery",
  "Team", "Pricing", "FAQ", "Contact", "Blog", "Login", "Account"
];

function isValidSectionType(type) {
  return ALLOWED_SECTION_TYPES.includes(type);
}

module.exports = { ALLOWED_SECTION_TYPES, ALLOWED_PAGE_NAMES, isValidSectionType };