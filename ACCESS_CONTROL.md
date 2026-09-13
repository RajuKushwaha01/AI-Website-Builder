# NovaBuilder — Access Control Audit

Every route in the platform, classified by who can call it and how ownership is enforced.

## [USER] — requires login, scoped to the caller's own data only

| Area | Routes | Ownership enforced by |
|---|---|---|
| Auth | /login, /register, /logout, /forgot-password | N/A (identity-establishing) |
| Profile | /profile, /profile/change-password | req.session.userId used directly — never a param |
| Dashboard | /dashboard, /dashboard/websites | Query filtered by `owner: req.session.userId` |
| Website CRUD | /websites/:id/* (settings, rename, duplicate, delete, archive, publish, unpublish, preview) | `verifyWebsiteOwnership()` middleware |
| Page manager | /websites/:id/pages/* | `verifyWebsiteOwnership()` middleware |
| Navigation | /websites/:id/navigation | `verifyWebsiteOwnership()` middleware |
| Visual Builder | /builder/:id, /builder/:id/* | `verifyWebsiteOwnership()` middleware |
| AI generation | /ai-builder, /ai/websites/:id/*, /ai/generate-website, /ai/transform-text | `verifyWebsiteOwnership()` on website-scoped routes; /ai/generate-website creates a new record owned by the caller |
| Create-website wizard | /create-website, /create-website/generate | Creates a new record owned by the caller |
| Publishing/SEO | /websites/:id/publish-live, /unpublish-live, /preview-live, /pages/seo | `verifyWebsiteOwnership()` middleware |
| Media | /dashboard/media, /media/upload, /media/:id/* | `verifyMediaOwnership()` middleware + upload always tagged with `owner: req.session.userId` |
| Forms | /dashboard/forms, /websites/:websiteId/forms/*, /forms/save, /forms/:id/delete, /forms/:formId/submissions, /submissions/:id/* | `verifyWebsiteOwnership("websiteId")` / `verifyFormOwnership()` / chain-verified for submissions |
| Analytics | /dashboard/analytics | Website list pre-filtered by `owner: req.session.userId` |
| Blog | /websites/:websiteId/blog, /blog/create, /blog/:id/* | `verifyWebsiteOwnership("websiteId")` / `verifyBlogPostOwnership()` |

**Rule enforced everywhere above:** a user ID never appears in a URL. Ownership is always resolved server-side from `req.session.userId` — a user cannot access another user's resource no matter what ID they type into the address bar.

## [ADMIN] — requires `role: "admin"`, platform-wide scope

| Area | Routes | Guard |
|---|---|---|
| Admin dashboard | /admin | `requireAdmin` |
| User management | /admin/users, /admin/users/:id/block, /unblock, /role, /delete | `requireAdmin` (operates on ANY user, by design) |
| Website management | /admin/websites, /admin/websites/:id/disable, /delete | `requireAdmin` (operates on ANY website, by design) |
| Templates | /admin/templates, /admin/templates/create, /:id/delete | `requireAdmin` |
| AI usage | /admin/ai-usage | `requireAdmin` |
| Forms overview | /admin/forms | `requireAdmin` |
| Reports | /admin/reports | `requireAdmin` |
| Security overview | /admin/security | `requireAdmin` |

**Rule enforced everywhere above:** `requireAdmin` checks `req.session.userId` → loads the user → confirms `role === "admin"` → also blocks the request entirely if that admin's own account was itself set to `status: "blocked"` by a higher admin. A regular user hitting any `/admin/*` route gets a plain 403, never a redirect that leaks whether the page exists.

## [PUBLIC] — no login required

| Area | Routes | Notes |
|---|---|---|
| Landing page | / | Static marketing page |
| Live websites | /w/:slug, /w/:slug/:pageSlug, /w/:slug/sitemap.xml, /w/:slug/robots.txt | Only serves websites with `status: "published"` — a draft is never reachable here |
| Form submission | /public/forms/:formId/submit | Rate-limited (`generalLimiter`); writes a submission but cannot read, list, or modify anything |

## Cross-role guarantees

1. **A user can never reach `/admin/*`** — `requireAdmin` checks role on every request; there is no shared session state that grants admin capability temporarily.
2. **An admin can still use their own regular account normally** — `/dashboard`, `/websites/:id/settings`, etc. work identically for an admin's own websites, scoped the same `owner: req.session.userId` way as any user. Admin powers are additive, not a replacement for the user-scoped routes.
3. **No route trusts a client-supplied owner/userId field.** Every ownership check re-derives the owner from `req.session.userId`, never from `req.body` or `req.query`.
4. **Blocked accounts are cut off everywhere**, not just at login — `requireAuth` re-checks `status` on every authenticated request and destroys the session if it finds `blocked`, so a mid-session block takes effect immediately.