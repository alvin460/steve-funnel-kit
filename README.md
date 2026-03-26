<p align="center">
  <img src="docs/damngood.png" alt="Damn Good Funnels" width="480" />
</p>

# Steve's Funnel Kit

Simple landing pages that actually convert. Built on a proper design system so AI can't produce slop.

> This repo is called Steve's Funnel Kit. The site is [damngoodfunnels.com](https://damngoodfunnels.com). The logo says Damn Good Funnels. Same project … different hat.

---

## WHAT IS THIS

A starter kit for building landing pages with AI. Clone the repo, tell your AI coding tool what you want, and it builds pages that look like you hired a designer. Twelve templates, 33 UI components, GoHighLevel CRM integration, free hosting on Cloudflare.

The whole thing is designed so non-technical people can ship production-quality landing pages in under an hour.

---

## HOW IT ALL FITS TOGETHER

Never touched code before? No worries. Here's every piece and how they connect.

```mermaid
flowchart TD
    subgraph BUILD["WHAT YOU WORK WITH"]
        direction TB
        CC["Claude Code … your AI builder"]
        ASTRO["Astro 5 … builds your pages"]
        REACT["React 19 … powers the forms"]
        TW["Tailwind CSS 4 … styling + design tokens"]
        CC -->|"creates & edits pages"| ASTRO
        ASTRO --- REACT
        ASTRO --- TW
    end

    subgraph SHIP["HOW IT GOES LIVE"]
        direction TB
        GH["GitHub … your fork of this repo"]
        CF["Cloudflare Pages … free hosting + SSL"]
        GH -->|"auto-deploys on push"| CF
    end

    subgraph LEADS["WHERE LEADS GO"]
        direction TB
        API["API endpoints … /api/lead, /api/contact"]
        GHL["GoHighLevel … CRM + automations"]
        API -->|"sends contact data"| GHL
    end

    ASTRO -->|"git push"| GH
    CF -->|"serves your site to"| VISITOR["Visitors"]
    VISITOR -->|"fills out a form"| API
```

**What you need before you start:**

| Piece | What it is | Cost |
|-------|-----------|------|
| [Claude Code](https://claude.ai/code) | AI coding tool … builds pages for you | Subscription |
| [Node.js](https://nodejs.org) | Runs the dev server locally | Free |
| [GitHub CLI (`gh`)](https://cli.github.com) | Fork, clone, manage your repo from terminal | Free |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) | Cloudflare CLI … deploy, set secrets, manage Pages | Free |
| [GoHighLevel](https://www.gohighlevel.com) | CRM … captures and manages your leads | Subscription |

> You don't need to understand any of this tech. Claude Code handles the code. The CLIs handle the infrastructure. You describe what you want … it gets built.

---

## WHAT YOU GET

→ **12 page templates** … Sales letter, squeeze, VSL, PAS, workshop, lead magnet (3 variants), multi-step form (2 steps), success page, payment page
→ **33 UI components** … Buttons, cards, forms, modals, accordions, badges, the works
→ **GoHighLevel integration** … Lead capture + qualification data goes straight to your CRM
→ **Free hosting** … Cloudflare Pages. Free SSL. Free CDN. $0/month
→ **Design token system** … One number change updates your brand color everywhere
→ **Security hardened** … CORS, rate limiting, encrypted secrets, input sanitization
→ **Mobile-first** … Every page responsive. Inputs are 16px so iOS doesn't zoom
→ **Dark mode** … Real dark mode that actually works
→ **Analytics ready** … Drop in your GA4 or GTM ID

---

## GET STARTED … ZERO TO LIVE IN AN HOUR

### Step 1: Install your tools

You need four things installed. All free except Claude Code.

```bash
# Claude Code … your AI builder
# Install from https://claude.ai/code

# Node.js … runs the dev server
# Install from https://nodejs.org (LTS version)

# GitHub CLI … manages your repo from terminal
brew install gh          # macOS
# or: https://cli.github.com for Windows/Linux

# Wrangler … Cloudflare CLI for deploy + secrets
npm install -g wrangler
```

Other AI tools work too ([Cursor](https://cursor.com), [Windsurf](https://windsurf.com), [Codex](https://openai.com/index/introducing-codex/)) but Claude Code is currently the best at this.

### Step 2: Fork + clone the repo

Three commands. That's it.

```bash
gh auth login                                        # one-time … authenticates GitHub
gh repo fork stvbutlr/steve-funnel-kit --clone       # forks into your account + clones locally
cd steve-funnel-kit && npm install && npm run dev     # install deps + start dev server
```

Open `http://localhost:4321` in your browser. You'll see the template gallery with live previews of every page.

> **Why fork instead of clone?** You need your own repo to push changes and trigger auto-deploys. Forking gives you a copy you own.

### Step 3: Brand it

The fastest way … open Claude Code in the project folder and type:

```
/brand-setup
```

It walks you through setting your company name, colors, logo, and fonts. Five minutes.

Or do it manually:

→ **Company name:** Edit `src/config/site.config.ts`
→ **Brand color:** Change `--brand-hue` in `src/styles/tokens/primitives.css` (e.g. `240` for blue, `25` for red)
→ **Logos:** Drop your SVGs into `src/assets/branding/`
→ **Font:** Update the import in `src/styles/global.css` and font name in `src/styles/themes/default.css`

### Step 4: Pick a template and customise

Every file in `src/pages/` becomes a URL. `squeeze.astro` → `yourdomain.com/squeeze`.

→ Browse the templates at `http://localhost:4321`
→ Find the closest one to what you need
→ Copy the file, rename it, change the content
→ Or just tell Claude Code: *"Create a new landing page for my coaching program"*

Type `/new-landing-page` in Claude Code for a guided walkthrough.

### Step 5: Connect GoHighLevel

Every form submits to GHL. Here's how to wire it up:

**5a. Get your credentials:**
1. Log into [GoHighLevel](https://app.gohighlevel.com)
2. **Settings > Business Profile** → copy your **Location ID**
3. **Settings > API Keys** → create a key → copy the **API Key**

**5b. Create your .env file:**

Copy `.env.example` to `.env` and fill in:

```env
GHL_API_KEY=your-api-key-here
GHL_LOCATION_ID=your-location-id-here
SITE_URL=https://yourdomain.com
```

> This file is gitignored. It never gets committed. Your keys stay local.

**5c. Update allowed domains:**

Open these files and add your domain to `ALLOWED_ORIGINS`:

→ `src/pages/api/lead.ts`
→ `src/pages/api/contact.ts`
→ `src/pages/api/newsletter.ts`
→ `src/pages/api/qualify.ts`

```typescript
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];
```

**5d. Test it:**

Submit a test lead on `http://localhost:4321/squeeze`. Check GoHighLevel … the contact should appear with your tags.

### Step 6: Add analytics (optional)

Add to your `.env`:

```env
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Or for GTM:

```env
PUBLIC_GTM_ID=GTM-XXXXXXX
```

Done. The analytics component picks it up automatically.

### Step 7: Deploy to Cloudflare (free)

Type `/deploy-setup` in Claude Code for the guided version. Or do it yourself from the terminal:

**7a. Sign up + login:**

Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) (free), then:

```bash
wrangler login    # opens browser … authorize and done
```

**7b. Connect your repo for auto-deploy:**

Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git** in the Cloudflare dashboard.

→ Connect your GitHub account
→ Select your forked `steve-funnel-kit` repo
→ Production branch: `main`
→ Build command: `npm run build`
→ Output directory: `dist`

> This is the one dashboard step. It links GitHub to Cloudflare so every push auto-deploys. One-time, takes 60 seconds.

**7c. Store your secrets via CLI:**

```bash
# Each command prompts for the value … never visible in logs or history
wrangler pages secret put GHL_API_KEY --project-name your-project-name
wrangler pages secret put GHL_LOCATION_ID --project-name your-project-name
wrangler pages secret put SITE_URL --project-name your-project-name

# Optional … analytics
wrangler pages secret put PUBLIC_GA_MEASUREMENT_ID --project-name your-project-name
```

> `your-project-name` is whatever you named it in step 7b. Check with `wrangler pages project list`.

**7d. Add your custom domain:**

In the Cloudflare dashboard: **your Pages project** → **Custom Domains** → add your domain. SSL is automatic.

### Step 8: Point your domain

This is the only truly manual step. Two options depending on your DNS setup:

**Option A … Move nameservers to Cloudflare (recommended):**

In your domain registrar (GoDaddy, Namecheap, etc.), change the nameservers to the ones Cloudflare gives you. Cloudflare then manages all your DNS. Easiest path … everything just works.

**Option B … Add a CNAME record (if you can't move nameservers):**

In your current DNS provider, add a CNAME record:

```
Type:   CNAME
Name:   @ (or www)
Value:  your-project-name.pages.dev
```

> Either way, SSL is automatic. Your site is live. $0/month.

### Deployment workflows

Pick whichever suits you:

**Simple workflow (local → main):**

You work locally, push to main, it goes live. Good for solo builders.

```bash
# Make your changes locally, then:
git add -A
git commit -m "Update squeeze page copy"
git push origin main
# → Cloudflare auto-deploys to production
```

**Staging workflow (local → staging → main):**

You push to a `staging` branch first to preview before going live. Good if you want to check things on a real URL before your audience sees it.

**One-time setup:**

```bash
git checkout -b staging
git push -u origin staging
```

Then in Cloudflare: your Pages project automatically creates preview deployments for non-production branches. Every push to `staging` gets its own preview URL (e.g. `staging.your-project.pages.dev`).

**Daily workflow:**

```bash
# 1. Work on staging
git checkout staging
# make changes…
git add -A
git commit -m "New workshop page"
git push origin staging
# → Cloudflare deploys a preview URL. Check it looks good.

# 2. Merge to main when ready
git checkout main
git merge staging
git push origin main
# → Cloudflare auto-deploys to production

# 3. Go back to staging for next round
git checkout staging
```

> **Don't know git?** That's fine. Claude Code handles it. Just say *"commit my changes and push to staging"* or *"merge staging into main and deploy."* It knows what to do.

---

## DEMO CONTENT … REPLACE THIS STUFF

The kit ships with example content so you can see what's possible. Before you go live, swap these out:

→ **About page** (`src/pages/about.astro`) … This is my story. Replace it with yours, or delete it
→ **Component gallery** (`src/pages/components.astro`) … Reference page showing all 33 components. Useful while building, but remove from your nav before launch
→ **Homepage social proof** (`src/pages/index.astro`) … The LinkNinja/SFC case studies are mine. Replace with your own examples or remove the section
→ **Lead magnet social proof** (`src/pages/lead-magnet.astro`) … References me and LinkNinja. Swap in your own
→ **Product mockup** (`public/images/product-mockup.webp`) … Placeholder image used in a few templates. Replace with your actual product
→ **Placeholder images** (`public/images/`) … `steve-b.jpg`, `linkninja-*`, `sfc-*` … delete once you've added your own
→ **Navigation** (`src/config/nav.config.ts`) … "Why I Built This" links to my about page. Change it to yours

The fastest way to handle all of this: run `/brand-setup` in Claude Code. It walks you through everything.

### Theme customizer

The floating theme customizer widget (the colour/font picker in the bottom corner) only appears when `PUBLIC_DEMO_MODE=true` is set in your environment. You won't see it unless you explicitly enable it.

If you want it on your own preview/demo site, add `PUBLIC_DEMO_MODE=true` to your `.env` or Cloudflare env vars. Otherwise, leave it off. Your users will never see it.

---

## TEMPLATES

| Template | URL | What it does |
|----------|-----|-------------|
| **Sales Letter** | `/sales-letter` | Long-form editorial with sticky sidebar CTA |
| **Squeeze** | `/squeeze` | Minimal single-screen lead capture |
| **VSL** | `/vsl` | Video embed + lead capture |
| **PAS** | `/pas` | Problem-Agitate-Solution sales page |
| **Workshop** | `/workshop` | Video embed + editorial + floating CTA + signup form |
| **Lead Magnet (Form)** | `/abt-form` | Lead magnet with inline form |
| **Lead Magnet (CTA)** | `/abt-page` | Lead magnet with CTA button |
| **Lead Magnet (Evergreen)** | `/lead-magnet` | Ebook mockup, inline form, social proof bar, table of contents |
| **Form (Step 1)** | `/form` | Lead capture with redirect to step 2 |
| **Form (Step 2)** | `/form/step-2` | Qualification questions → GHL contact notes |
| **Success** | `/success` | Resource delivery page with download button |
| **Payment** | `/payment` | Branded checkout page → links to GHL payment link |

---

## MULTI-STEP FORMS

The kit includes a two-step form flow:

→ **Step 1** (`/form`) … Captures name, email, phone. Creates contact in GHL. Redirects to step 2 with email in URL.
→ **Step 2** (`/form/step-2`) … Asks qualification questions (biggest challenge, revenue range, how they found you). Saves responses as a **note on the GHL contact record**. No custom fields setup required.

### How qualification data lands in GHL

All step 2 responses are formatted into a single contact note:

```
--- Qualification (2026-03-26) ---
Biggest Challenge: Not enough leads
Revenue Range: $20k–$100k/mo
How Found: LinkedIn
```

To customise the questions, edit `src/components/forms/QualifyForm.tsx`. The default questions are placeholders … change them to whatever makes sense for your offer.

### Resource delivery on success

The `LeadCaptureForm` component supports showing a resource link after submission:

```astro
<LeadCaptureForm
  client:load
  formTags={['lead_magnet']}
  submitLabel="Get the Playbook"
  successLinkUrl="https://example.com/my-guide.pdf"
  successLinkLabel="Read the Playbook"
/>
```

Form submits → inline success state appears with a button linking directly to the resource. No redirect. No "check your inbox."

---

## PAYMENT PAGES

The kit includes a payment page template (`/payment`) for selling products via GoHighLevel.

**How it works:** Your branded page shows the product details, price, features, and guarantee. The "Buy Now" button links directly to your GHL payment link. User clicks, GHL handles the checkout. No iframes, no payment processing on your end.

**To set up:**
1. Create a payment link in GoHighLevel (**Payments > Payment Links**)
2. Copy the URL (e.g. `https://secure.yourdomain.com/payment-link/abc123`)
3. Edit `src/pages/payment.astro` and set the `paymentUrl` variable
4. Customise the product name, price, features list, and guarantee text

**Why not iframe the GHL checkout?** GHL payment pages block iframes via security headers. Even if they didn't, payment forms in iframes trigger browser security warnings. A branded page with a direct link is cleaner, faster, and more trustworthy.

---

## AI SLASH COMMANDS

| Command | What it does |
|---------|-------------|
| `/brand-setup` | Colors, fonts, logos, site config … guided setup |
| `/new-landing-page` | Create a new page from any template |
| `/deploy-setup` | Connect GHL + deploy to Cloudflare |

### Example prompts

→ *"Create a new squeeze page for my free guide"*
→ *"Add a testimonial section to the PAS page"*
→ *"Make a workshop page for my webinar next Thursday"*
→ *"Create a multi-step form that asks about their business size and goals"*

---

## SECURITY

All hardened out of the box:

→ **CORS** … only your whitelisted domain(s) can submit forms
→ **Rate limiting** … 10/min for leads, 5/min for contact/newsletter/qualify
→ **Encrypted secrets** … GHL keys stored encrypted on Cloudflare, never in frontend code
→ **Origin validation** … blocks requests without valid Origin header
→ **Input sanitization** … HTML stripped, length limits enforced
→ **Tag allowlisting** … only pre-approved tags reach GHL
→ **Honeypot fields** … silent bot detection
→ **Security headers** … CSP, HSTS, X-Frame-Options via `public/_headers`

---

## TECH STACK

| Tool | Version | Purpose |
|------|---------|---------|
| [Astro](https://astro.build) | 5.x | Static site generator, islands architecture |
| [React](https://react.dev) | 19 | Interactive components (forms) |
| [Tailwind CSS](https://tailwindcss.com) | 4.0 | Utility-first styling with design tokens |
| [Cloudflare Pages](https://pages.cloudflare.com) | — | Free edge hosting with Workers for APIs |
| [GoHighLevel](https://www.gohighlevel.com) | — | CRM for lead capture and automation |
| [TypeScript](https://typescriptlang.org) | 5.7 | Type safety |

---

## COMMANDS

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## PROJECT STRUCTURE

```
src/
├── pages/                  # Each .astro file = a URL
│   ├── api/                # Server endpoints (lead, contact, newsletter, qualify)
│   ├── form/               # Multi-step form (step 1 + step 2)
│   └── blog/               # Blog listing + posts
├── components/
│   ├── ui/                 # Design system (buttons, cards, forms, etc.)
│   ├── forms/              # LeadCaptureForm, QualifyForm, MobileFormSheet
│   ├── layout/             # Header, Footer
│   ├── hero/               # Hero section component
│   └── seo/                # SEO metadata
├── layouts/                # Page wrappers (Marketing, Landing, Lead, Blog)
├── styles/
│   ├── tokens/             # Design tokens (colors, typography, spacing)
│   └── themes/             # Theme files (default, midnight)
├── config/                 # Site config, navigation
├── lib/                    # GHL client, validation, utilities
└── assets/branding/        # Your logo SVGs
```

---

## TROUBLESHOOTING

### "MessageChannel is not defined" on deploy

React 19's SSR bundle uses `MessageChannel`, which doesn't exist in Cloudflare's Workers runtime. This kit already has the fix baked in … two things make it work:

→ `wrangler.toml` has `compatibility_flags = ["nodejs_compat"]`
→ `astro.config.mjs` aliases `react-dom/server` → `react-dom/server.edge` (the edge build doesn't use MessageChannel)

If you see this error, check that both of those are still in place. Don't remove them.

### Forms returning 403 or CORS errors

You need to add your domain to `ALLOWED_ORIGINS` in the API files. See Step 5c above.

### Dark mode flickers on page load

The kit handles this with an inline script in `<head>`. If you've modified `BaseLayout.astro` or `LeadLayout.astro`, make sure the dark mode script is still in the `<head>` before any content renders.

---

## MORE FROM STEVE

→ [LinkNinja](https://linkninja.co) … AI-powered LinkedIn sales pipeline. Close deals in DMs without the cringe.
→ [Seven Figure Creators](https://sevenfigurecreators.com) … Use LinkedIn to hit 6, then 7 figures. The playbook.
→ [Headcount Zero](https://headcountzero.com) … Systems over staff. Building lean businesses with zero employees. Coming soon.
