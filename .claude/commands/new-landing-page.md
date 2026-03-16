Create a new landing page using the Velocity design system. Follow every step below exactly.

$ARGUMENTS

## Step 1: Gather Requirements

Ask the user for:
1. **Page name** — Will become the URL slug (e.g., "webinar" → `/webinar`)
2. **Page type** — Which template is closest to what they want:
   - `squeeze` — Minimal lead capture (email + name only)
   - `sales-letter` — Long-form editorial with sticky sidebar CTA
   - `vsl` — Video embed + lead capture form
   - `pas` — Problem-Agitate-Solution sales page
   - `abt-form` — Lead magnet with inline form
   - `abt-page` — Lead magnet with CTA button (no inline form)
   - `dm-workshop` — Workshop/event signup
   - `custom` — Start from scratch with MarketingLayout
3. **Headline** — The main H1 text
4. **Subheadline** — Supporting text under the headline
5. **CTA label** — Button text (e.g., "Get Instant Access", "Reserve My Spot")
6. **Form tags** — GHL tags for this page's leads (e.g., `['webinar_signup']`)

If the user provided these details in $ARGUMENTS, skip asking and proceed.

## Step 2: Choose the Right Layout

Based on the page type, select the layout:

| Page Type | Layout | Why |
|-----------|--------|-----|
| squeeze | `LeadLayout` | Minimal, no header/footer distractions |
| sales-letter | `MarketingLayout` | Full site chrome for credibility |
| vsl | `LeadLayout` | Focus on video + form |
| pas | `MarketingLayout` | Long-form needs navigation |
| abt-form | `MarketingLayout` | Lead magnet with full site |
| abt-page | `MarketingLayout` | Lead magnet with full site |
| dm-workshop | `LandingLayout` | Full-width for event pages |
| custom | `MarketingLayout` | Default safe choice |

## Step 3: Read the Closest Template

Read the existing page that matches the selected page type from `src/pages/`. Use it as the structural reference — copy its layout, component imports, and section pattern.

## Step 4: Create the Page File

Create `src/pages/{page-name}.astro` with:

### Required Imports
```astro
---
import {LayoutName} from '@/layouts/{LayoutName}.astro';
import SEO from '@/components/seo/SEO.astro';
// Add component imports based on sections needed
---
```

### Rules for the Page Content

1. **Colors** — Only use token classes: `bg-background`, `text-foreground`, `text-brand-500`, `border-border`, etc. NEVER use `bg-white`, `text-gray-*`, or hex values.

2. **Typography** — Use `font-display` + `tracking-tight` on all headings. Use standard Tailwind sizes (`text-xl`, `text-3xl`, etc.). NEVER use raw pixel sizes.

3. **Spacing** — Use `py-[var(--space-section)]` or `py-[var(--space-section-lg)]` for sections. Use `mb-[var(--space-section-header)]` between section titles and content. Use `pt-[var(--space-page-top)]` at the top of the page.

4. **Responsive** — Write mobile-first. Add `md:` and `lg:` breakpoint overrides. Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

5. **Components** — Import from `@/components/ui/` categories:
   - Buttons: `@/components/ui/form/Button/Button.astro`
   - Cards: `@/components/ui/data-display/Card/Card.astro`
   - Badges: `@/components/ui/data-display/Badge/Badge.astro`
   - Icons: `@/components/ui/primitives/Icon/Icon.astro`
   - Alerts: `@/components/ui/feedback/Alert/Alert.astro`
   - CTA: `@/components/ui/marketing/CTA/CTA.astro`

6. **Lead Forms** — Use `LeadCaptureForm` with `client:load`:
   ```astro
   <LeadCaptureForm client:load formTags={['your_tag']} submitLabel="CTA Text" />
   ```

7. **Mobile Form** — For pages with sidebar forms, add `MobileFormSheet` for mobile:
   ```astro
   <div class="lg:hidden">
     <MobileFormSheet client:load formTags={['tag']} submitLabel="CTA Text" />
   </div>
   ```

8. **Inverted Sections** — For dark sections on light pages, use `class="invert-section bg-background"`. Never manually override foreground colors inside.

9. **SEO** — Include unique `title` and `description` via the layout's props or the SEO component.

10. **Section Pattern** — Follow this structure for every section:
    ```astro
    <section class="py-[var(--space-section-lg)]">
      <div class="mx-auto max-w-6xl px-6">
        <!-- section content -->
      </div>
    </section>
    ```

## Step 5: Update Form Tags (if needed)

If the user specified custom form tags, check `src/pages/api/lead.ts` and add them to the `ALLOWED_TAGS` array if they're not already present.

## Step 6: Add to Navigation (optional)

Ask the user if they want this page in the site navigation. If yes, update `src/config/nav.config.ts`.

## Step 7: Summary

Print:
- File created: `src/pages/{page-name}.astro`
- URL: `http://localhost:4321/{page-name}`
- Any files modified (lead.ts tags, nav config)
- Remind user to test manually at the URL above
