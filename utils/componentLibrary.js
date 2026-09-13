// Defines every draggable component available in the builder (Section 23).
// "basic" items insert a single-field section; "website" items insert full sections.

module.exports = {
  basic: [
    { type: "heading", label: "Heading", icon: "heading", defaultContent: { text: "Your Heading Here", level: "h2" } },
    { type: "paragraph", label: "Paragraph", icon: "align-left", defaultContent: { text: "Write something engaging here." } },
    { type: "text", label: "Text", icon: "type", defaultContent: { text: "Short text block" } },
    { type: "image", label: "Image", icon: "image", defaultContent: { src: "", alt: "Image" } },
    { type: "button", label: "Button", icon: "mouse-pointer-click", defaultContent: { text: "Click Me", link: "#" } },
    { type: "icon", label: "Icon", icon: "star", defaultContent: { icon: "star" } },
    { type: "video", label: "Video", icon: "video", defaultContent: { url: "" } },
    { type: "divider", label: "Divider", icon: "minus", defaultContent: {} },
    { type: "spacer", label: "Spacer", icon: "move-vertical", defaultContent: { height: 40 } }
  ],
  website: [
    { type: "navbar", label: "Navbar", icon: "layout-panel-top", defaultContent: { logoText: "Brand", links: ["Home", "About", "Contact"] } },
    { type: "hero", label: "Hero", icon: "sparkles", defaultContent: { title: "Your Big Headline", subtitle: "A short supporting sentence.", buttonText: "Get Started" } },
    { type: "footer", label: "Footer", icon: "layout-panel-bottom", defaultContent: { text: "© 2026 Your Business" } },
    { type: "about", label: "About", icon: "info", defaultContent: { heading: "About Us", text: "Tell your story here." } },
    { type: "services", label: "Services", icon: "grid-2x2", defaultContent: { heading: "Our Services", items: [{ title: "Service 1", description: "Description" }] } },
    { type: "gallery", label: "Gallery", icon: "images", defaultContent: { heading: "Gallery", images: [] } },
    { type: "team", label: "Team", icon: "users", defaultContent: { heading: "Our Team", members: [{ name: "Team Member", role: "Role" }] } },
    { type: "testimonials", label: "Testimonials", icon: "quote", defaultContent: { heading: "What People Say", items: [{ name: "Customer", quote: "Great service!" }] } },
    { type: "faq", label: "FAQ", icon: "help-circle", defaultContent: { heading: "FAQ", items: [{ question: "Question?", answer: "Answer." }] } },
    { type: "pricing", label: "Pricing", icon: "tag", defaultContent: { heading: "Pricing", plans: [{ name: "Basic", price: "$9/mo" }] } },
    { type: "cta", label: "CTA", icon: "megaphone", defaultContent: { heading: "Ready to get started?", buttonText: "Contact Us" } },
    { type: "contact", label: "Contact", icon: "mail", defaultContent: { heading: "Contact Us", text: "Reach out anytime." } },
    { type: "login", label: "Login Form", icon: "log-in", defaultContent: { heading: "Member Login" } },
    { type: "signup", label: "Signup Form", icon: "user-plus", defaultContent: { heading: "Create an Account" } },
    { type: "booking", label: "Booking Form", icon: "calendar", defaultContent: { heading: "Book a Reservation" } },
    { type: "newsletter", label: "Newsletter", icon: "mail", defaultContent: { heading: "Stay Updated", subtext: "Subscribe for news and updates." } }
  ]
};