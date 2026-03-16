Walk the user through branding their Velocity Funnel Kit site. Follow every step below in order.

$ARGUMENTS

## Step 1: Company Info

Ask the user for:
1. **Company name** — appears in headers, footers, legal text
2. **Tagline / description** — shows in Google search results
3. **Website URL** — their live domain (e.g., `https://example.com`)
4. **Author name** — for meta tags
5. **Contact email** — for footer and legal pages

If the user provided these in $ARGUMENTS, skip asking and proceed.

Then update `src/config/site.config.ts`:
- Set `name` to the company name
- Set `description` to the tagline
- Set `url` to the live domain
- Set `author` to the author name
- Set `email` to the contact email

## Step 2: Brand Color

Show the user the available hue options:

| Color | Hue |
|-------|-----|
| Red | `25` |
| Orange | `55` |
| Amber/Gold | `75` |
| Yellow | `95` |
| Lime | `130` |
| Green/Emerald | `162` (default) |
| Teal | `180` |
| Cyan | `200` |
| Blue | `240` |
| Indigo | `260` |
| Violet/Purple | `295` |
| Pink | `340` |

Ask which color they want. Then update `src/styles/tokens/primitives.css`:
- Find all 10 `--brand-*` lines (brand-50 through brand-900)
- Replace the hue number (last value in the `oklch()` function) on ALL 10 lines
- The current default hue is `162` (emerald green)

**Important:** Only change the hue (third value). Do NOT change lightness (first value) or chroma (second value) — those are carefully calibrated for accessibility contrast.

## Step 3: Logo Files

Tell the user to place their logo files in `src/assets/branding/`:

| File | Purpose |
|------|---------|
| `logo-full.svg` | Full logo for light backgrounds |
| `logo-full-dark.svg` | Full logo for dark backgrounds |
| `logomark.svg` | Icon/symbol for light backgrounds |
| `logomark-dark.svg` | Icon/symbol for dark backgrounds |

Also: replace `public/favicon.svg` with their browser tab icon.

**Tip:** If they only have one logo, they can use the same file for both light and dark variants.

Do NOT create or generate logo files — the user must provide their own SVGs.

## Step 4: Font (Optional)

Show the pre-installed font options:

| Font | Style | Import path |
|------|-------|------------|
| `Plus Jakarta Sans Variable` | Geometric, premium (default) | `@fontsource-variable/plus-jakarta-sans` |
| `Inter Variable` | Clean, neutral | `@fontsource-variable/inter` |
| `Manrope Variable` | Geometric, modern | `@fontsource-variable/manrope` |
| `Outfit Variable` | Friendly, rounded | `@fontsource-variable/outfit` |

Ask if they want to change from the default. If yes:

1. Update the `@import` in `src/styles/global.css` to the new font package
2. Update `--theme-font-sans` in `src/styles/themes/default.css` to the new font name
3. If they want a different display font for headings, also update `--theme-font-display`

**Note:** The monospace font (`JetBrains Mono Variable`) is used for code and prices — leave it as-is unless specifically asked.

## Step 5: Theme (Optional)

Two themes are included:
- `default.css` — Clean, brand-neutral (active by default)
- `midnight.css` — Deep purple with violet accents

Ask if they want to switch. If yes, update `src/styles/tokens/colors.css` line 9:
```css
/* @import '../themes/default.css'; */
@import '../themes/midnight.css';
```

## Step 6: Summary

Print what was changed:
- Site config: company name, URL, etc.
- Brand color: old hue → new hue (color name)
- Font: old → new (if changed)
- Theme: old → new (if changed)
- Logo files: remind user to place SVGs in `src/assets/branding/`

Print the test URL:
- App: http://localhost:4321

Tell the user to check:
- Header shows their company name and logo
- Brand color appears on buttons, links, and accents
- Dark mode toggle works (top right) and colors adapt
- Footer has correct company info
