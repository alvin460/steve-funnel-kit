Guide the user through deploying their Steve's Funnel Kit to Cloudflare Pages with GoHighLevel integration. Follow every step below in order.

$ARGUMENTS

## Step 1: Gather Info

Ask the user for:
1. **Live domain** … e.g., `example.com` (they must already own this domain)
2. **GHL API Key** … from GoHighLevel Settings > API Keys
3. **GHL Location ID** … from GoHighLevel Settings > Business Profile

If they don't have GHL credentials yet, walk them through getting them:
-> Log into https://app.gohighlevel.com
-> **Location ID**: Settings → Business Profile → copy the Location ID
-> **API Key**: Settings → API Keys → Create New Key → copy the key

If the user provided these in $ARGUMENTS, skip asking and proceed.

## Step 2: Create the .env File

Check if `.env` already exists in the project root. If not, create it with:

```env
# GoHighLevel CRM
GHL_API_KEY=<their-api-key>
GHL_LOCATION_ID=<their-location-id>

# Site URL (used for SEO and CORS)
SITE_URL=https://<their-domain>
```

If `.env` already exists, update only the values they provided.

**Important:** Verify `.env` is in `.gitignore`. If not, warn the user and add it.

## Step 3: Update CORS Allowed Origins

Update `ALLOWED_ORIGINS` in all 4 API endpoint files:

-> `src/pages/api/lead.ts`
-> `src/pages/api/contact.ts`
-> `src/pages/api/newsletter.ts`
-> `src/pages/api/qualify.ts`

Set them to:
```typescript
const ALLOWED_ORIGINS = [
  'https://<their-domain>',
  'https://www.<their-domain>',
];
```

## Step 4: Update Site URL

Update `url` in `src/config/site.config.ts` to `https://<their-domain>`.

## Step 5: Deploy to Cloudflare

**5a. Login to Cloudflare via CLI:**

The user needs a Cloudflare account. Sign up at https://dash.cloudflare.com (free). Then:

```bash
wrangler login    # opens browser … authorize and done
```

**5b. Connect repo for auto-deploy:**

This is the one dashboard step … it links GitHub to Cloudflare so every push auto-deploys. One-time, takes 60 seconds.

Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git** in the Cloudflare dashboard.

-> Connect your GitHub account
-> Select your forked repo
-> Production branch: `main`
-> Build command: `npm run build`
-> Output directory: `dist`
-> Save and Deploy

**5c. Store secrets via CLI:**

```bash
# Each command prompts for the value … never visible in logs or history
wrangler pages secret put GHL_API_KEY --project-name <project-name>
wrangler pages secret put GHL_LOCATION_ID --project-name <project-name>
wrangler pages secret put SITE_URL --project-name <project-name>

# Optional … analytics
wrangler pages secret put PUBLIC_GA_MEASUREMENT_ID --project-name <project-name>
wrangler pages secret put PUBLIC_GTM_ID --project-name <project-name>
```

`<project-name>` is whatever they named it in step 5b. Check with `wrangler pages project list`.

**5d. Add custom domain:**

In the Cloudflare dashboard: **Pages project** → **Custom Domains** → add the domain. SSL is automatic.

**5e. Point DNS:**

This is the only truly manual step. Two options:

**Option A … Move nameservers to Cloudflare (recommended):**
In their domain registrar (GoDaddy, Namecheap, etc.), change the nameservers to the ones Cloudflare provides. Cloudflare then manages all DNS. Easiest path … everything just works.

**Option B … Add a CNAME record (if they can't move nameservers):**
In their current DNS provider, add a CNAME record:

```
Type:   CNAME
Name:   @ (or www)
Value:  <project-name>.pages.dev
```

## Step 6: First Deploy

Tell the user:

```bash
git add .
git commit -m "Configure domain and GHL integration"
git push origin main
```

Every push to `main` triggers an automatic deployment. The first build takes 1-2 minutes.

## Step 7: Verify Deployment

After deploy completes, tell the user to check:

1. **Site loads**: Visit `https://<their-domain>` … should show their branded site
2. **HTTPS works**: Padlock icon appears in the browser
3. **Lead form works**: Submit a test lead and check it appears in GoHighLevel
4. **Contact form works**: Submit the contact page form
5. **Dark mode works**: Toggle should function on the live site

If lead forms don't work, common issues:
-> **CORS error in console**: `ALLOWED_ORIGINS` doesn't match the exact domain (check www vs non-www)
-> **500 error**: Environment variables not set in Cloudflare (check GHL_API_KEY and GHL_LOCATION_ID)
-> **404 on /api/lead**: Make sure `export const prerender = false` is at the top of the API files

## Step 8: Summary

Print:
-> Domain: `https://<their-domain>`
-> Secrets stored via: `wrangler pages secret put`
-> Environment variables: GHL_API_KEY, GHL_LOCATION_ID, SITE_URL
-> Files modified: .env, lead.ts, contact.ts, newsletter.ts, qualify.ts, site.config.ts
-> Next deploy: `git push origin main`
-> Check deploy status: `wrangler pages deployment list --project-name <project-name>`
