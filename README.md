# Velocity Funnel Kit

You know those landing pages that actually convert? The ones with the perfect spacing, the right CTA placement, dark mode that doesn't look broken?

This is the boilerplate that makes them.

Built on Astro, Tailwind CSS v4, and a design token system that means AI coding tools (Claude Code, Cursor, Windsurf… whatever you use) produce beautiful, production-grade pages without you needing to know CSS.

Ship a complete marketing site in a weekend. No design skills needed. Seriously.

---

## WHAT'S IN THE BOX

→ **7 page templates** … Sales letter, squeeze page, VSL, PAS, lead magnet (2 variants), workshop landing
→ **57 UI components** … Buttons, cards, forms, modals, accordions, badges, the works
→ **GoHighLevel integration** … Lead capture forms submit straight to your GHL CRM
→ **Cloudflare hosting** … Deploy to the edge for free with automatic SSL
→ **Dark mode** … Automatic light/dark that just works
→ **Security hardened** … CORS, rate limiting, CSP headers, input sanitization
→ **Mobile-first** … Every page is responsive. Tested at every breakpoint.

---

## QUICK START

Two commands. That's it.

```bash
npm install
npm run dev
```

Open `http://localhost:4321` in your browser. You'll see the site running with placeholder branding.

Now let's make it yours.

---

## STEP 1: BRAND YOUR SITE

### 1a. Set Your Company Name

Open **`src/config/site.config.ts`** and fill in your details:

```typescript
const siteConfig: SiteConfig = {
  name: 'Your Company Name',        // shows in headers, footers, legal text
  description: 'What your company does',  // shows in Google search results
  url: 'https://yourdomain.com',     // your live domain
  author: 'Your Name',
  email: 'hello@yourdomain.com',
};
```

Save. Done. Your company name now appears everywhere across the site.

### 1b. Replace Your Logos

Drop your logo files into **`src/assets/branding/`**:

| File | What it's for |
|------|--------------|
| `logo-full.svg` | Full logo (light backgrounds) |
| `logo-full-dark.svg` | Full logo (dark backgrounds) |
| `logomark.svg` | Icon/symbol only (light backgrounds) |
| `logomark-dark.svg` | Icon/symbol only (dark backgrounds) |

Also replace **`public/favicon.svg`** … that's the little icon in the browser tab.

> Only have one logo? Use the same file for both light and dark. It'll work fine.

### 1c. Change Your Brand Color

This is the fun part.

Open **`src/styles/tokens/primitives.css`** and find the Brand Scale section. You'll see 10 lines that look like this:

```css
--brand-500: oklch(64% 0.17 162);   /* 162 = emerald green */
```

That last number (`162`) is the hue. Change it on ALL 10 `--brand-*` lines to pick your color:

| Color | Hue number |
|-------|-----------|
| Red | `25` |
| Orange | `55` |
| Amber/Gold | `75` |
| Yellow | `95` |
| Lime | `130` |
| Green/Emerald | `162` |
| Teal | `180` |
| Cyan | `200` |
| Blue | `240` |
| Indigo | `260` |
| Violet/Purple | `295` |
| Pink | `340` |

So if you want blue… find-and-replace `162` with `240` across all 10 lines.

Only change the last number. Leave the first two values alone… they control brightness and saturation and are already dialed in for accessibility.

### 1d. Change Your Font (Optional)

The default font is **Plus Jakarta Sans**. It's clean and premium-looking.

Want something different? These are already installed and ready to go:

→ `Plus Jakarta Sans Variable` … geometric, premium (this is the default)
→ `Inter Variable` … clean, neutral (the Vercel look)
→ `Manrope Variable` … geometric, modern
→ `Outfit Variable` … friendly, rounded

To switch:

1. Update the import in **`src/styles/global.css`**:
   ```css
   @import '@fontsource-variable/inter';        /* was plus-jakarta-sans */
   ```
2. Update the font name in **`src/styles/themes/default.css`**:
   ```css
   --theme-font-sans: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, ...;
   ```

### 1e. Switch Themes (Optional)

Two themes are included:

→ `default.css` … clean, brand-neutral (active by default)
→ `midnight.css` … deep purple with violet accents

To switch, edit **`src/styles/tokens/colors.css`** line 9:

```css
/* @import '../themes/default.css'; */
@import '../themes/midnight.css';
```

---

## STEP 2: CONNECT GOHIGHLEVEL

Every lead capture form on the site submits directly to GoHighLevel. Here's how to wire it up.

### 2a. Get Your GHL Credentials

1. Log into [GoHighLevel](https://app.gohighlevel.com)
2. Go to **Settings > Business Profile** … copy your **Location ID**
3. Go to **Settings > API Keys** … click "Create New Key" … copy the **API Key**

Keep both handy. You'll need them in the next step.

### 2b. Create Your .env File

In the project root (same folder as `package.json`), create a new file called **`.env`** and paste this in:

```env
# GoHighLevel CRM
GHL_API_KEY=your-api-key-here
GHL_LOCATION_ID=your-location-id-here

# Your live domain (used for SEO and security)
SITE_URL=https://yourdomain.com
```

Replace the placeholder values with your actual credentials.

> This file is already in `.gitignore` so it won't get committed. Never share it. Never upload it. It has your API keys in it.

### 2c. Update Allowed Domains

Your API endpoints only accept form submissions from domains you whitelist. This stops randoms from submitting junk leads.

Open these 3 files and update `ALLOWED_ORIGINS` with your domain:

→ **`src/pages/api/lead.ts`**
→ **`src/pages/api/contact.ts`**
→ **`src/pages/api/newsletter.ts`**

```typescript
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];
```

### 2d. Customize Lead Tags (Optional)

Each page template sends specific tags to GHL so you can segment your leads. Want to add your own?

Update the allowlist in **`src/pages/api/lead.ts`**:

```typescript
const ALLOWED_TAGS = [
  'website_lead',
  'funnel_signup',
  // add your tags here
];
```

Then set matching tags on the page's form:

```astro
<LeadCaptureForm formTags={['website_lead', 'funnel_signup']} />
```

---

## STEP 3: DEPLOY TO CLOUDFLARE PAGES

Cloudflare Pages is free, fast, and handles SSL for you. Here's how to go live.

### 3a. Create a Cloudflare Account

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up (free)
2. Verify your email
3. Click **Workers & Pages** in the left sidebar

### 3b. Connect Your GitHub Repo

1. Click **Create** then **Pages** then **Connect to Git**
2. Authorize Cloudflare to see your GitHub repos
3. Select this repository
4. Set the build settings:
   → **Build command:** `npm run build`
   → **Build output directory:** `dist`
5. Click **Save and Deploy**

It'll build and deploy automatically. Takes about a minute.

### 3c. Add Your Secrets

Your GHL credentials need to live in Cloudflare too (not just your local `.env`).

In your Pages project, go to **Settings > Environment Variables** and add:

| Variable | Value | Encrypt? |
|----------|-------|----------|
| `GHL_API_KEY` | Your GHL API key | **Yes** |
| `GHL_LOCATION_ID` | Your GHL location ID | **Yes** |
| `SITE_URL` | `https://yourdomain.com` | No |

> Why encrypt? Your API key is a secret. Once encrypted, nobody can read it in the dashboard… not even you. It's one-way. This is what you want.

### 3d. Add Your Domain

1. In your Pages project, click **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain

If your domain's DNS is already on Cloudflare… it's automatic. If it's elsewhere, Cloudflare will tell you what CNAME record to add.

SSL is handled automatically. No certificates to set up. No renewals to worry about.

### 3e. Deploy

From now on, every push to `main` triggers a new deployment:

```bash
git add .
git commit -m "Configure branding and GHL integration"
git push origin main
```

That's it. Your site is live.

---

## PAGE TEMPLATES

Every template is a starting point. Copy one, rename it, change the copy. The design stays solid.

| Page | URL | What it does |
|------|-----|-------------|
| **Homepage** | `/` | Interactive game intro + lead capture |
| **Sales Letter** | `/sales-letter` | Long-form editorial with sticky sidebar CTA |
| **Sales Letter 2** | `/sales-letter-2` | WSJ-style "Tale of Two Closers" variant |
| **Squeeze** | `/squeeze` | Minimal single-screen lead capture |
| **VSL** | `/vsl` | Video embed + lead capture form |
| **PAS** | `/pas` | Full Problem-Agitate-Solution sales page |
| **ABT Form** | `/abt-form` | Lead magnet with inline form |
| **ABT Page** | `/abt-page` | Lead magnet with CTA button |
| **DM Workshop** | `/dm-workshop` | Workshop signup landing page |
| **Contact** | `/contact` | Contact form |
| **About** | `/about` | About page |
| **Blog** | `/blog` | Blog listing + individual posts |

### Creating New Pages

Create a new `.astro` file in `src/pages/`. The filename becomes the URL:

```
src/pages/my-offer.astro  →  yourdomain.com/my-offer
```

Find the template closest to what you want, copy it, rename it, and change the content.

---

## USING AI TO BUILD PAGES (THE GOOD PART)

This is why the repo exists.

The `CLAUDE.md` file in the project root teaches AI coding tools exactly how the design system works. So when you tell Claude Code (or Cursor, or Windsurf) to "create a new landing page for my coaching program"… it uses the right components, the right colors, the right spacing, and the right responsive patterns.

You don't need to know CSS. You don't need to know what a design token is. You just describe what you want and the AI builds it correctly.

### Try These Prompts

→ "Create a new landing page for [your offer]"
→ "Add a testimonial section to the PAS page"
→ "Change the hero section copy to…"
→ "Add a pricing comparison table"
→ "Make a new squeeze page for my free guide"

### What the AI Won't Break

The `CLAUDE.md` file enforces these rules so the AI can't mess things up:

→ Only uses design system components (no janky raw HTML)
→ Only uses design tokens for colors (no hardcoded hex values that break dark mode)
→ Preserves responsive breakpoints and mobile layouts
→ Uses proper Astro layouts for new pages
→ Follows the component variant system for customization

You focus on the copy and the offer. The AI handles the design.

---

## AI SLASH COMMANDS

Three repo-specific commands are included to help you get set up:

| Command | What it does |
|---------|-------------|
| `/new-landing-page` | Scaffolds a new page with the right layout, components, and form setup |
| `/brand-setup` | Interactive walkthrough for colors, fonts, logos, and site config |
| `/deploy-setup` | End-to-end guide from domain to Cloudflare Pages with GHL secrets |

Just type the command and follow the prompts. The AI walks you through everything.

---

## PROJECT STRUCTURE (FOR THE CURIOUS)

You don't need to understand this to use the kit. But if you want to poke around:

```
src/
├── pages/                  # Each .astro file = a URL route
│   └── api/                # Server endpoints (lead, contact, newsletter)
├── components/
│   ├── ui/                 # Design system (buttons, cards, forms, etc.)
│   ├── forms/              # LeadCaptureForm, MobileFormSheet
│   ├── layout/             # Header, Footer, ThemeToggle
│   ├── hero/               # Hero section component
│   └── seo/                # SEO metadata components
├── layouts/                # Page wrappers (Marketing, Landing, Lead, Blog)
├── styles/
│   ├── tokens/             # Design tokens (colors, typography, spacing)
│   └── themes/             # Theme files (default, midnight)
├── config/                 # Site config, navigation
├── lib/                    # GHL client, validation, utilities
└── assets/branding/        # Your logo SVGs
```

---

## SECURITY

All API endpoints are production-hardened out of the box:

→ **CORS** … only your domain(s) can submit forms
→ **Rate limiting** … 10/min for leads, 5/min for contact/newsletter
→ **Origin validation** … blocks requests without a valid Origin header
→ **Content-Type enforcement** … lead endpoint requires JSON
→ **Body size limits** … 16KB for leads/newsletter, 64KB for contact
→ **Input sanitization** … HTML characters stripped, max-length validation
→ **Tag allowlisting** … only pre-approved tags reach GHL
→ **Honeypot fields** … silent bot detection on contact and newsletter forms
→ **Security headers** … CSP, HSTS, X-Frame-Options via `public/_headers`

You don't need to configure any of this. It's already set up.

---

## TECH STACK

| Tool | Version | Purpose |
|------|---------|---------|
| [Astro](https://astro.build) | 5.x | Static site generator with islands architecture |
| [React](https://react.dev) | 19 | Interactive components (forms, game) |
| [Tailwind CSS](https://tailwindcss.com) | 4.0 | Utility-first styling with design tokens |
| [Cloudflare Pages](https://pages.cloudflare.com) | — | Edge hosting with Workers for API routes |
| [GoHighLevel](https://www.gohighlevel.com) | — | CRM for lead capture and automation |
| [TypeScript](https://typescriptlang.org) | 5.7 | Type safety |

---

## COMMANDS

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

Built on the [Velocity](https://github.com/southwellmedia/velocity) design system.
