# ✦ NovaBuilder — AI Website Builder Platform

An AI-powered website builder: describe your idea, get a full website, then edit it visually and publish it live — all self-hosted on the free tier.

## Stack

- HTML + CSS + JavaScript, EJS templates
- Tailwind CSS
- Node.js + Express.js
- MongoDB + Mongoose
- AI: Gemini Free Tier → OpenRouter Free → Ollama (automatic fallback chain)
- SortableJS (drag-and-drop builder)
- Express Session + bcrypt (auth)
- Helmet + CSRF + rate limiting + express-mongo-sanitize + sanitize-html (security)

## Full Feature Set (Section 54 checklist — all implemented)

- **User**: registration, login, logout, forgot password, profile, settings
- **Website**: create (guided wizard + form), edit, delete, duplicate, rename, preview, publish, unpublish
- **AI**: website generation, page generation, section generation, content generation, rewriting, SEO, FAQ, design modification, AI editor assistant — all via structured JSON, never raw HTML/JS
- **Builder**: drag-and-drop, components, sections, properties, colors, typography, spacing, background, borders, shadows, responsive preview
- **Pages**: create, edit, delete, duplicate, rename, slug, set homepage, navigation
- **Media**: upload, preview, delete, alt text
- **SEO**: title, description, slug, sitemap.xml, robots.txt, Open Graph, alt text
- **Forms**: form builder (9 field types), contact form, submissions, email-notification hook
- **Data**: autosave, draft/live separation, version history, restore
- **Analytics**: visitors, page views, sessions, popular pages, device, browser, referrer
- **Admin**: users, websites, templates, AI usage, forms, reports, security
- **Security**: bcrypt, sessions, CSRF, Helmet, XSS sanitization, NoSQL-injection protection, rate limiting, input validation, upload validation, authorization, AI output validation

## AI Providers

- **Gemini** (primary): `https://aistudio.google.com/apikey`
- **OpenRouter** (fallback): `https://openrouter.ai/keys`

Both are pure HTTP APIs — no local installation required, and both work identically on any hosting provider (Render, Railway, etc.). Just add `GEMINI_API_KEY` and `OPENROUTER_API_KEY` as environment variables in your hosting dashboard when you deploy.

**Fallback order:** every AI request tries Gemini first, then OpenRouter if Gemini fails or hits a rate limit. Only one needs to work, but configuring both gives you better reliability.