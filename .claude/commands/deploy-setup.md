Guide the user through deploying their Velocity Funnel Kit to Cloudflare Pages with GoHighLevel integration. Follow every step below in order.

$ARGUMENTS

## Step 1: Gather Info

Ask the user for:
1. **Live domain** — e.g., `example.com` (they must already own this domain)
2. **GHL API Key** — from GoHighLevel Settings > API Keys
3. **GHL Location ID** — from GoHighLevel Settings > Business Profile

If they don't have GHL credentials yet, walk them through getting them:
- Log into https://app.gohighlevel.com
- **Location ID**: Settings → Business Profile → copy the Location ID
- **API Key**: Settings → API Keys → Create New Key → copy the key

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

Update `ALLOWED_ORIGINS` in all 3 API endpoint files:

- `src/pages/api/lead.ts`
- `src/pages/api/contact.ts`
- `src/pages/api/newsletter.ts`

Set them to:
```typescript
const ALLOWED_ORIGINS = [
  'https://<their-domain>',
  'https://www.<their-domain>',
];
```

## Step 4: Update Site URL

Update `url` in `src/config/site.config.ts` to `https://<their-domain>`.

## Step 5: Cloudflare Pages Setup (Instructions for User)

Print the following step-by-step instructions for the user to follow in their browser:

### 5a. Create Cloudflare Account (if needed)
1. Go to https://dash.cloudflare.com and sign up (free tier is fine)
2. Verify your email

### 5b. Create a Pages Project
1. In the Cloudflare dashboard, click **Workers & Pages** in the left sidebar
2. Click **Create** → **Pages** → **Connect to Git**
3. Authorize Cloudflare to access your GitHub account
4. Select your repository
5. Configure build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**

### 5c. Add Environment Variables
1. In your Pages project, go to **Settings** → **Environment Variables**
2. Add these variables for **Production** (and optionally Preview):

| Variable | Value | Encrypt? |
|----------|-------|----------|
| `GHL_API_KEY` | `<their-api-key>` | **Yes** |
| `GHL_LOCATION_ID` | `<their-location-id>` | **Yes** |
| `SITE_URL` | `https://<their-domain>` | No |

3. Click **Save**

**Why encrypt?** The API key is a secret. Encrypting means nobody can read it after saving — not even in the dashboard.

### 5d. Add Custom Domain
1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `<their-domain>`
4. Cloudflare will show DNS instructions:
   - If the domain is on Cloudflare DNS: it's automatic
   - If elsewhere: add a CNAME record pointing to `<project>.pages.dev`
5. Also add `www.<their-domain>` and set up a redirect rule or second custom domain

### 5e. SSL/HTTPS
Cloudflare handles SSL automatically. No certificate setup needed.

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

1. **Site loads**: Visit `https://<their-domain>` — should show their branded site
2. **HTTPS works**: The padlock icon appears in the browser
3. **Lead form works**: Submit a test lead and check it appears in GoHighLevel
4. **Contact form works**: Submit the contact page form
5. **Dark mode works**: Toggle should function on the live site

If lead forms don't work, common issues:
- **CORS error in console**: `ALLOWED_ORIGINS` doesn't match the exact domain (check www vs non-www)
- **500 error**: Environment variables not set in Cloudflare (check GHL_API_KEY and GHL_LOCATION_ID)
- **404 on /api/lead**: Make sure `export const prerender = false` is at the top of the API files

## Step 8: Summary

Print:
- Domain: `https://<their-domain>`
- Cloudflare project: (they'll see this in their dashboard)
- Environment variables to set: GHL_API_KEY, GHL_LOCATION_ID, SITE_URL
- Files modified: .env, lead.ts, contact.ts, newsletter.ts, site.config.ts
- Next deploy: `git push origin main`
