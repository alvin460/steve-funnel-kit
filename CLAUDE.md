# Steve's Funnel Kit … AI Instructions

Astro 5 marketing site with Tailwind CSS v4, React 19, and GoHighLevel CRM. Design tokens, CVA component variants, semantic color architecture.

## Golden Rules

1. **Use the design system.** Never create raw HTML for something a component already handles.
2. **Use design tokens.** Never hardcode hex/rgb colors, pixel font sizes, or pixel spacing. Always use token variables or Tailwind classes that map to tokens.
3. **Preserve responsive behavior.** Every page must work at mobile (320px), tablet (768px), and desktop (1024px+). Never remove responsive classes or breakpoint logic.
4. **Use existing layouts.** New pages MUST use one of the layouts in `src/layouts/`. Never write a standalone `<!doctype html>` page without a layout.
5. **Use existing components.** Check `src/components/ui/` before building anything custom. 33 components across 8 categories.
6. **Never use Tailwind's default color palette.** No `bg-slate-*`, `text-zinc-*`, `bg-gray-*`, `text-emerald-*`, `bg-blue-*`, `text-red-*`, etc. The ONLY color classes allowed are our token classes (`bg-background`, `text-foreground`, `text-brand-500`, etc.). If it's a color name from tailwindcss.com/docs/colors … it's wrong.
7. **No scoped `<style>` for things Tailwind handles.** Only use `<style>` blocks for complex CSS animations or third-party widget overrides. Colors, spacing, typography, layout … always Tailwind classes.

## Architecture

```
src/pages/my-page.astro          # Route (URL)
  └── imports a Layout           # BaseLayout, MarketingLayout, LandingLayout, LeadLayout, PageLayout, BlogLayout
       └── uses Components       # From src/components/ui/, hero/, forms/, patterns/
            └── styled by Tokens # From src/styles/tokens/ and themes/
```

### Key Directories

-> `src/pages/` … file-based routing. `foo.astro` → `/foo`
-> `src/layouts/` … page wrappers. Always wrap pages in a layout
-> `src/components/ui/` … the component library. 33 components across 8 categories
-> `src/components/_demo/` … demo-only (ThemeCustomizer). Only renders when `PUBLIC_DEMO_MODE=true`
-> `src/components/forms/` … `LeadCaptureForm.tsx` (React) and `MobileFormSheet.tsx`
-> `src/components/hero/` … Hero section with `layout`, `size`, variant props
-> `src/components/patterns/` … composed patterns (ContactForm, StatCard, etc.)
-> `src/styles/tokens/` … design tokens (colors, typography, spacing)
-> `src/styles/themes/` … theme files (default.css, midnight.css)
-> `src/config/site.config.ts` … site name, URL, branding metadata
-> `src/lib/ghl.ts` … GoHighLevel API client
-> `src/lib/cn.ts` … `cn()` utility for merging Tailwind classes

## Color System … NEVER Use Raw Colors

Three layers:

1. **Primitives** (`tokens/primitives.css`) … raw OKLCH scales: `--gray-*`, `--brand-*`, `--orange-*`, `--blue-*`
2. **Semantic tokens** (`themes/default.css`) … purpose-based: `--background`, `--foreground`, `--border`, `--primary`
3. **Tailwind classes** (`global.css @theme`) … `bg-background`, `text-foreground`, `border-border`, `text-brand-500`

### What to Use

```
bg-background          text-foreground         border-border
bg-secondary           text-foreground-muted   border-strong
bg-card                text-brand-500          text-primary
var(--foreground)      var(--background)       var(--border)
```

### What NOT to Use

```
bg-white               text-gray-500           border-gray-200
bg-black               text-[#333]             color: #ff0000
bg-slate-100           text-zinc-400           style="color: red"
```

### BANNED … Tailwind Default Palette

These are Tailwind's built-in colors. Never use them. They bypass our token system.

```
slate-*, gray-*, zinc-*, neutral-*, stone-*
red-*, orange-*, amber-*, yellow-*, lime-*
green-*, emerald-*, teal-*, cyan-*, sky-*
blue-*, indigo-*, violet-*, purple-*, fuchsia-*
pink-*, rose-*
```

The ONLY named color scales in this project:
-> `brand-*` (50-900) … maps to `--brand-hue` in primitives.css
-> `gray-*` … our custom OKLCH gray, NOT Tailwind's gray
-> `orange-*` … accent only (500, 600)
-> `blue-*` … accent only (500, 600)

Raw colors break dark mode, inverted sections, and theme switching. Token-based colors adapt automatically.

### Brand Color Classes

Use `text-brand-500`, `bg-brand-300`, etc. for accent colors. The brand scale (50-900) is defined in `primitives.css` via `--brand-hue` and can be changed by the user. Never reference the specific color (e.g., "emerald") … always use `brand-*`.

### Inverted Sections

For dark sections on light pages, add `class="invert-section"` to the container. All child token classes automatically remap. Never manually override colors inside inverted sections.

```astro
<section class="invert-section bg-background py-20">
  <!-- text-foreground is now light text, bg-secondary is now dark -->
</section>
```

## Typography … NEVER Use Raw Sizes

### Font Families

```
font-sans       → var(--theme-font-sans)     … body text
font-display    → var(--theme-font-display)   … headings
font-mono       → var(--theme-font-mono)      … code, prices, labels
```

### Font Sizes

Tailwind's standard size classes map to our fluid `clamp()` scale:

```
text-xs  text-sm  text-base  text-lg  text-xl  text-2xl  text-3xl  text-4xl  text-5xl
```

Never use `text-[14px]`, `text-[1.2rem]`, or `style="font-size: 18px"`.

### Heading Pattern

```astro
<h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
  Section Title
</h2>
```

Always use `font-display` + `tracking-tight` on headings. `font-bold` (700) for headings, `font-semibold` (600) for subheadings.

## Spacing … Use the Token Scale

### Section Spacing

```
py-[var(--space-section)]         … standard section padding
py-[var(--space-section-lg)]      … large section padding
mb-[var(--space-section-header)]  … gap between section title and content
pt-[var(--space-page-top)]        … top of page (clears fixed header)
```

### General Spacing

Use Tailwind spacing utilities (`p-4`, `gap-6`, `mt-8`). These map to a 4px base scale. For section-level spacing, use the `--space-*` variables above.

Never use `style="margin-top: 47px"` or `p-[23px]`.

## Component Library

### How Components Work

```
src/components/ui/form/Button/
├── Button.astro          # Astro server component
├── Button.tsx            # React interactive component
├── button.variants.ts    # CVA variant definitions
└── index.ts              # Barrel export
```

### Import Pattern

```astro
---
import Button from '@/components/ui/form/Button/Button.astro';
import Card from '@/components/ui/data-display/Card/Card.astro';
import Badge from '@/components/ui/data-display/Badge/Badge.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import Alert from '@/components/ui/feedback/Alert/Alert.astro';
import Accordion from '@/components/ui/overlay/Accordion/Accordion.astro';
import CTA from '@/components/ui/marketing/CTA/CTA.astro';
---
```

### Available Components

**Form:** Button, Input, Textarea, Select, Checkbox, Radio, Switch
**Data Display:** Card, Badge, Avatar, AvatarGroup, Table, Pagination, Progress, Skeleton, GoogleMap
**Feedback:** Alert, Toast, Tooltip
**Overlay:** Dialog, Dropdown, Accordion, Tabs, VerticalTabs, ConsentBanner
**Marketing:** Logo, CTA, NpmCopyButton, SocialProof, TerminalDemo
**Content:** CodeBlock
**Layout:** Separator
**Primitives:** Icon

### Component Variants (CVA)

```astro
<!-- Button variants -->
<Button variant="primary" size="lg">Primary Large</Button>
<Button variant="secondary" size="md">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<!-- Card variants -->
<Card variant="default" padding="lg">Default card</Card>
<Card variant="solid">Solid background</Card>
<Card variant="outline">Outlined</Card>

<!-- Badge variants -->
<Badge variant="brand" pill>Label</Badge>
<Badge variant="default">Default</Badge>

<!-- Alert variants -->
<Alert variant="info">Info message</Alert>
<Alert variant="success">Success</Alert>
<Alert variant="warning">Warning</Alert>
<Alert variant="error">Error</Alert>
```

### Class Merging with cn()

```typescript
import { cn } from '@/lib/cn';
cn('px-4 py-2', isActive && 'bg-primary', className);
```

## Layouts

| Layout | When to use |
|--------|------------|
| `MarketingLayout` | Standard pages with header + footer |
| `LandingLayout` | Full-width landing pages |
| `LeadLayout` | Lead capture / squeeze pages |
| `PageLayout` | Content pages (non-landing) with header + footer |
| `BlogLayout` | Blog posts |
| `BaseLayout` | Raw HTML shell (rarely used directly) |

```astro
---
import MarketingLayout from '@/layouts/MarketingLayout.astro';
---
<MarketingLayout title="Page Title" description="SEO description">
  <!-- page content -->
</MarketingLayout>
```

## Hero Component

```astro
---
import Hero from '@/components/hero/Hero.astro';
---
<Hero layout="centered" size="lg">
  <Badge slot="badge" variant="brand" pill>New</Badge>
  <h1 slot="title">Your Headline</h1>
  <p slot="description">Supporting text</p>
  <Fragment slot="actions">
    <Button size="lg" href="#cta">Get Started</Button>
  </Fragment>
</Hero>
```

**Layout options:** `centered`, `split`
**Size options:** `sm`, `md`, `lg`, `xl`

## Lead Capture Forms

```astro
---
import LeadCaptureForm from '@/components/forms/LeadCaptureForm.tsx';
---
<LeadCaptureForm
  client:load
  formTags={['your_tag']}
  submitLabel="Get Started"
  termsHtml="<p>Terms text</p>"
/>
```

Always use `client:load` for React components. The form submits to `/api/lead` which forwards to GoHighLevel.

For mobile sticky forms:
```astro
<div class="lg:hidden">
  <MobileFormSheet client:load formTags={['tag']} submitLabel="CTA Text" />
</div>
```

## Responsive Breakpoints

```
sm:   640px   … small phones → larger phones
md:   768px   … phones → tablets
lg:  1024px   … tablets → desktop
xl:  1280px   … desktop → wide desktop
```

### Patterns

```astro
<!-- Text sizes scale up -->
<h1 class="text-2xl md:text-3xl lg:text-5xl">

<!-- Grid columns increase -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- Show/hide at breakpoints -->
<div class="hidden lg:block">Desktop only</div>
<div class="lg:hidden">Mobile/tablet only</div>

<!-- Padding increases -->
<section class="px-6 md:px-10 lg:px-16">
```

Mobile-first: write base styles for mobile, then add `md:` and `lg:` overrides. Never use `@media` queries in inline styles. The `container` class is max-width 1280px with responsive padding.

## SEO

```astro
---
import SEO from '@/components/seo/SEO.astro';
---
<head>
  <SEO title="Page Title" description="Description for Google" />
</head>
```

Every page must have a unique `title` and `description`.

## API Endpoints

-> `POST /api/lead` … GHL lead capture (JSON body, rate limited 10/min)
-> `POST /api/contact` … contact form (FormData, rate limited 5/min)
-> `POST /api/newsletter` … newsletter signup (FormData, rate limited 5/min)
-> `POST /api/qualify` … qualification questions (JSON body, rate limited 5/min)

All endpoints validate origin, enforce body size limits, and sanitize input. The `ALLOWED_ORIGINS` array in each file controls which domains can submit.

## Files You Should NOT Modify

-> `src/styles/global.css` … Tailwind config, animations, base layer
-> `src/styles/tokens/spacing.css` … spacing scale
-> `src/styles/tokens/typography.css` … fluid type scale
-> `src/lib/cn.ts` … class merge utility
-> Component `*.variants.ts` files … CVA variant definitions
-> `astro.config.mjs` … build configuration

## Files Safe to Modify

-> `src/pages/*` … add/edit page content freely
-> `src/config/site.config.ts` … site name, URL, branding
-> `src/config/nav.config.ts` … navigation menu items
-> `src/styles/tokens/primitives.css` … brand color hue (change `--brand-hue: 162` to your hue)
-> `src/styles/themes/default.css` … font family, shadows, border radius
-> `src/styles/tokens/colors.css` … theme switcher (line 9)
-> `src/assets/branding/*` … logo SVG files
-> `src/pages/api/*` … `ALLOWED_ORIGINS` and `ALLOWED_TAGS` arrays
-> `src/content/*` … blog posts, FAQs, author data

## Common Patterns

### Section with heading + content

```astro
<section class="py-[var(--space-section-lg)]">
  <div class="mx-auto max-w-6xl px-6">
    <div class="text-center mb-[var(--space-section-header)]">
      <p class="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Label</p>
      <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        Section Title
      </h2>
      <p class="mt-4 text-base leading-relaxed text-foreground-muted max-w-2xl mx-auto">
        Description text
      </p>
    </div>
    <!-- section content here -->
  </div>
</section>
```

### Feature grid

```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card variant="default" padding="lg">
    <Icon name="zap" class="w-10 h-10 text-brand-500" />
    <h3 class="mt-4 text-lg font-bold text-foreground">Feature Title</h3>
    <p class="mt-2 text-sm text-foreground-muted">Description</p>
  </Card>
</div>
```

### CTA section

```astro
<CTA variant="invert" size="lg">
  <Badge slot="logo" variant="brand" pill>Label</Badge>
  <h2 slot="heading">Call to Action</h2>
  <p slot="description">Supporting text</p>
</CTA>
```

### Benefits list with checkmarks

```astro
<ul class="space-y-3">
  {benefits.map((item) => (
    <li class="flex gap-3 items-start text-foreground-secondary text-sm">
      <Icon name="check-circle" size="sm" class="text-brand-500 mt-0.5 shrink-0" />
      <span>{item}</span>
    </li>
  ))}
</ul>
```

## Demo Content … Replace Before Going Live

The kit ships with example content. Replace these before deploying:

| What | Where | Action |
|------|-------|--------|
| About page | `src/pages/about.astro` | Replace with your own story or delete |
| Component gallery | `src/pages/components.astro` | Dev reference. Remove from nav for production |
| Homepage social proof | `src/pages/index.astro` (lines 211-285) | Replace LinkNinja/SFC examples or remove |
| Lead magnet social proof | `src/pages/lead-magnet.astro` (lines 117-119) | Replace Steve Butler / LinkNinja |
| Logo SVGs | `src/assets/branding/` | Replace with your own logo files |
| Site config | `src/config/site.config.ts` | Update company name, URL, author |
| Navigation | `src/config/nav.config.ts` | Update links |
| Product mockup | `public/images/product-mockup.webp` | Replace with your actual product |
| Placeholder images | `public/images/steve-b.jpg`, `linkninja-*`, `sfc-*` | Replace or delete |

Fastest way: run `/brand-setup` in Claude Code.

## Demo Mode (Theme Customizer)

The theme customizer widget is gated behind `PUBLIC_DEMO_MODE=true`. It does NOT render unless this env var is set.

-> **To enable** (demo/preview site): add `PUBLIC_DEMO_MODE=true` to `.env` or Cloudflare env vars
-> **To disable** (production): don't set the env var (default)
-> The customizer lives in `src/components/_demo/` … safe to delete if you never need it
