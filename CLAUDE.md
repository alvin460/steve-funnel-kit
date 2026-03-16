# Velocity Funnel Kit — AI Instructions

This is an Astro 5 marketing site with Tailwind CSS v4, React 19, and a GoHighLevel CRM integration. It uses the Velocity design system with design tokens, CVA component variants, and a semantic color architecture.

## Golden Rules

1. **Use the design system.** Never create raw HTML for something a component already handles.
2. **Use design tokens.** Never hardcode hex/rgb colors, pixel font sizes, or pixel spacing. Always use token variables or Tailwind classes that map to tokens.
3. **Preserve responsive behavior.** Every page must work at mobile (320px), tablet (768px), and desktop (1024px+). Never remove responsive classes or breakpoint logic.
4. **Use existing layouts.** New pages MUST use one of the layouts in `src/layouts/`. Never write a standalone `<!doctype html>` page without a layout (exception: pages that intentionally manage their own `<html>` like sales-letter pages).
5. **Use existing components.** Check `src/components/ui/` before building anything custom. The component library has buttons, cards, badges, inputs, selects, accordions, tabs, dialogs, tooltips, alerts, and more.

## Architecture

### Page → Layout → Components

```
src/pages/my-page.astro          # Route (URL)
  └── imports a Layout           # BaseLayout, MarketingLayout, LandingLayout, LeadLayout, BlogLayout
       └── uses Components       # From src/components/ui/, hero/, forms/, patterns/
            └── styled by Tokens # From src/styles/tokens/ and themes/
```

### Key Directories

- `src/pages/` — File-based routing. `foo.astro` → `/foo`
- `src/layouts/` — Page wrappers. Always wrap pages in a layout.
- `src/components/ui/` — The component library. 31 components across 8 categories.
- `src/components/forms/` — `LeadCaptureForm.tsx` (React) and `MobileFormSheet.tsx`
- `src/components/hero/` — Hero section with `layout`, `size`, variant props
- `src/components/patterns/` — Composed patterns (ContactForm, StatCard, etc.)
- `src/styles/tokens/` — Design tokens (colors, typography, spacing)
- `src/styles/themes/` — Theme files (default.css, midnight.css)
- `src/config/site.config.ts` — Site name, URL, branding metadata
- `src/lib/ghl.ts` — GoHighLevel API client
- `src/lib/cn.ts` — `cn()` utility for merging Tailwind classes

## Color System — NEVER Use Raw Colors

All colors flow through three layers:

1. **Primitives** (`tokens/primitives.css`) — Raw OKLCH scales: `--gray-*`, `--brand-*`, `--orange-*`, `--blue-*`
2. **Semantic tokens** (`themes/default.css`) — Purpose-based: `--background`, `--foreground`, `--border`, `--primary`, etc.
3. **Tailwind classes** (`global.css @theme`) — `bg-background`, `text-foreground`, `border-border`, `text-brand-500`, etc.

### What to Use

```
✅ bg-background          ✅ text-foreground         ✅ border-border
✅ bg-secondary            ✅ text-foreground-muted   ✅ border-strong
✅ bg-card                 ✅ text-brand-500          ✅ text-primary
✅ var(--foreground)       ✅ var(--background)       ✅ var(--border)
```

### What NOT to Use

```
❌ bg-white               ❌ text-gray-500           ❌ border-gray-200
❌ bg-black               ❌ text-[#333]             ❌ color: #ff0000
❌ bg-slate-100           ❌ text-zinc-400           ❌ style="color: red"
```

**Why:** Raw colors break dark mode, inverted sections, and theme switching. Token-based colors adapt automatically.

### Brand Color Classes

Use `text-brand-500`, `bg-brand-300`, etc. for accent colors. The brand scale (50–900) is defined in `primitives.css` and can be changed by the user. Never reference the specific color (e.g., "emerald") — always use `brand-*`.

### Inverted Sections

For dark sections on light pages, add `class="invert-section"` to the container. All child token classes automatically remap to dark-on-light values. Never manually override colors inside inverted sections.

```astro
<section class="invert-section bg-background py-20">
  <!-- text-foreground is now light text, bg-secondary is now dark -->
</section>
```

## Typography — NEVER Use Raw Sizes

### Font Families

```
✅ font-sans       → var(--theme-font-sans)     — body text
✅ font-display    → var(--theme-font-display)   — headings (same as sans by default)
✅ font-mono       → var(--theme-font-mono)      — code, prices, labels
```

### Font Sizes

Use Tailwind's standard size classes. They map to the fluid `clamp()` scale:

```
✅ text-xs  text-sm  text-base  text-lg  text-xl  text-2xl  text-3xl  text-4xl  text-5xl
❌ text-[14px]  text-[1.2rem]  style="font-size: 18px"
```

### Heading Pattern

```astro
<h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
  Section Title
</h2>
```

Always use `font-display` + `tracking-tight` on headings. Use `font-bold` (700) for headings, `font-semibold` (600) for subheadings.

## Spacing — Use the Token Scale

### Section Spacing

```
✅ py-[var(--space-section)]         — standard section padding
✅ py-[var(--space-section-lg)]      — large section padding
✅ mb-[var(--space-section-header)]  — gap between section title and content
✅ pt-[var(--space-page-top)]        — top of page (clears fixed header)
```

### General Spacing

Use Tailwind spacing utilities (`p-4`, `gap-6`, `mt-8`, etc.). These map to a 4px base scale. For larger section-level spacing, use the `--space-*` variables above.

```
❌ style="margin-top: 47px"
❌ p-[23px]
```

## Component Library

### How Components Work

Every UI component follows this pattern:

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
**Overlay:** Dialog, Dropdown, Accordion, Tabs, VerticalTabs
**Marketing:** Logo, CTA, NpmCopyButton, SocialProof, TerminalDemo
**Layout:** Separator
**Primitives:** Icon

### Component Variants (CVA)

Components use `class-variance-authority` for type-safe variants:

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

Use `cn()` (from `@/lib/cn`) to safely merge Tailwind classes:

```typescript
import { cn } from '@/lib/cn';
cn('px-4 py-2', isActive && 'bg-primary', className);
```

## Layouts

### Available Layouts

| Layout | When to use |
|--------|------------|
| `MarketingLayout` | Standard pages with header + footer |
| `LandingLayout` | Full-width landing pages |
| `LeadLayout` | Lead capture / squeeze pages |
| `BlogLayout` | Blog posts |
| `BaseLayout` | Raw HTML shell (rarely used directly) |

### Usage

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

Tailwind breakpoints used throughout the project:

```
sm:   640px   — small phones → larger phones
md:   768px   — phones → tablets
lg:  1024px   — tablets → desktop
xl:  1280px   — desktop → wide desktop
```

### Patterns to Follow

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

### Rules

- Mobile-first: write base styles for mobile, then add `md:` and `lg:` overrides
- Never use `@media` queries in inline styles — use Tailwind breakpoint prefixes
- Test at 320px, 768px, and 1024px minimum
- The `container` class is max-width 1280px with responsive padding

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

- `POST /api/lead` — GHL lead capture (JSON body, rate limited 10/min)
- `POST /api/contact` — Contact form (FormData, rate limited 5/min)
- `POST /api/newsletter` — Newsletter signup (FormData, rate limited 5/min)

All endpoints validate origin, enforce body size limits, and sanitize input. The `ALLOWED_ORIGINS` array in each file controls which domains can submit.

## Files You Should NOT Modify

Unless you fully understand the design system architecture:

- `src/styles/global.css` — Tailwind config, animations, base layer
- `src/styles/tokens/spacing.css` — Spacing scale
- `src/styles/tokens/typography.css` — Fluid type scale
- `src/lib/cn.ts` — Class merge utility
- Component `*.variants.ts` files — CVA variant definitions
- `astro.config.mjs` — Build configuration

## Files Safe to Modify

- `src/pages/*` — Add/edit page content freely
- `src/config/site.config.ts` — Site name, URL, branding
- `src/config/nav.config.ts` — Navigation menu items
- `src/styles/tokens/primitives.css` — Brand color hue (change `162` to your hue)
- `src/styles/themes/default.css` — Font family, shadows, border radius
- `src/styles/tokens/colors.css` — Theme switcher (line 9)
- `src/assets/branding/*` — Logo SVG files
- `src/pages/api/*` — `ALLOWED_ORIGINS` and `ALLOWED_TAGS` arrays
- `src/content/*` — Blog posts, FAQs, author data

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
