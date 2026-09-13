// Scans the user's description for backend-functionality keywords and maps
// them to REAL, pre-built, safe backend features — never AI-generated code.
// This is the safe alternative to "let the AI write server logic."

const BACKEND_SIGNALS = {
  memberAuth: {
    keywords: ["login", "sign up", "signup", "user account", "member area", "membership", "register users", "authentication", "log in"],
    sections: ["login", "signup"],
    label: "Member login & signup"
  },
  booking: {
    keywords: ["booking", "reservation", "book a table", "appointment", "schedule a visit", "book now"],
    sections: ["booking"],
    label: "Booking / reservation system"
  },
  newsletter: {
    keywords: ["newsletter", "subscribe", "mailing list", "email updates", "email list"],
    sections: ["newsletter"],
    label: "Newsletter signup"
  },
  contactStorage: {
    keywords: ["contact form", "get in touch", "contact us", "inquiry form", "message us"],
    sections: ["contact", "form"],
    label: "Contact form with database storage"
  }
};

function detectBackendNeeds(description) {
  const text = description.toLowerCase();
  const detected = [];

  for (const [key, config] of Object.entries(BACKEND_SIGNALS)) {
    const matched = config.keywords.some((kw) => text.includes(kw));
    if (matched) {
      detected.push({ feature: key, sections: config.sections, label: config.label });
    }
  }

  return detected;
}

module.exports = { detectBackendNeeds, BACKEND_SIGNALS };