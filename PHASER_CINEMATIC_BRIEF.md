# Phaser Cinematic Homepage — Integration Brief

## What Was Added

A 5-beat Phaser 3 cinematic experience has been copied from the SFC Dashboard onboarding flow (`sfc-dashboard` repo) into this marketing site. It's a retro NES-style animated intro that sells the LinkNinja product through pixel art ninja characters and typewriter dialog.

### Files Added

```
src/phaser/
  main.js                      # Phaser game config (960x540, FIT scale)
  EventBus.js                  # React ↔ Phaser event communication
  sprites/NinjaSprite.js       # 16x16 pixel art ninja (6 poses, canvas-rendered)
  ui/TypewriterText.js         # Character-by-character typewriter text system
  scenes/
    sceneUtils.js              # Shared: sky gradient, moon, stars, city skyline
    DMJungleScene.js           # Beat 1: "The DM Jungle" — 363 unread DMs pile up
    OrderFromChaosScene.js     # Beat 2: "Order from Chaos" — AI classifies pipeline
    ShadowCloneScene.js        # Beat 3: "Your Shadow Clone" — AI learns your context
    DualWieldScene.js          # Beat 4: "The Dual Wield" — Dashboard + AI chat
    BeginTrainingScene.js      # Beat 5: "Begin Training" — 4-step checklist

src/components/game/
  PhaserGame.tsx               # React wrapper (client:only="react" island)
```

### How It Works

1. `PhaserGame.tsx` mounts a Phaser canvas into a div
2. Scenes play sequentially — each ends with a typewriter dialog box
3. User presses Enter/Space/Click to advance through dialog, then to next beat
4. After Beat 5 completes, `EventBus.emit('beat-complete')` triggers `onComplete` callback
5. Progress dots below the canvas show current beat

### Visual Style

- **960x540** internal resolution, 16:9, scales via FIT mode
- **Font**: "Press Start 2P" (Google Font) at 8-10px — retro pixel font
- **Color palette**: Dark navy backgrounds (#0D0D0D, #1A1A2E), brand lime (#CEF17B) accents
- **Sprites**: 16x16 pixel art ninjas rendered to canvas textures with NEAREST filtering
- **Text**: All text uses `resolution: 4` for crisp rendering on Retina displays
- **pixelArt: false** globally — text gets LINEAR filtering, sprites get NEAREST manually

---

## What Needs To Be Built

### 1. Install Dependencies

```bash
npm install phaser
```

Also add the Press Start 2P font. Either:
- `npm install @fontsource/press-start-2p` and import in the page
- Or add a Google Fonts link: `<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">`

### 2. Homepage Integration

Create or modify the homepage (`src/pages/index.astro`) to:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import PhaserGame from '../components/game/PhaserGame'
---

<BaseLayout title="LinkNinja — AI-Powered LinkedIn Pipeline">
  <!-- Minimal nav (logo + waitlist CTA button) -->
  <nav>...</nav>

  <!-- Full-viewport Phaser cinematic -->
  <section id="cinematic" class="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
    <PhaserGame client:only="react" onComplete={() => {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
    }} />
  </section>

  <!-- Waitlist / Lead Capture (appears after cinematic or on scroll) -->
  <section id="waitlist" class="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
    <!-- Retro-styled lead capture form -->
    <!-- Use the existing LeadCaptureForm component or build a themed one -->
    <!-- Fields: name, email, LinkedIn URL (optional) -->
    <!-- Submit to POST /api/lead -->
  </section>

  <!-- Minimal footer -->
  <footer>...</footer>
</BaseLayout>
```

### 3. Modify Beat 5 for Marketing

Beat 5 (BeginTrainingScene.js) currently says "FOUR STEPS TO GO LIVE" and lists onboarding steps. For the marketing homepage, consider:
- Change dialog text to "READY TO BECOME A NINJA?" or similar
- Change CTA from "PRESS ENTER TO START TRAINING" to "PRESS ENTER TO JOIN"
- The `onComplete` callback handles the transition to the waitlist form

Alternatively, keep Beat 5 as-is (it sells the setup process) and just let the `onComplete` scroll to the waitlist form below.

### 4. Lead Capture Form Design

Match the retro aesthetic:
- Dark background (#0D0D0D or #1A1A2E)
- Lime green (#CEF17B) borders and accents
- "Press Start 2P" font for headings
- Standard font for input fields (readability)
- Subtle ninja sprite or animation
- Copy: "JOIN THE WAITLIST" / "GET EARLY ACCESS" / "ENTER THE DOJO"

### 5. Nav & Footer

**Nav** — Minimal, dark, transparent over the cinematic:
- LinkNinja logo (left) — use existing `src/assets/branding/` logos
- "JOIN WAITLIST" button (right) — scrolls to #waitlist
- Maybe: "About" link if about page is ready

**Footer** — Minimal:
- Copyright, privacy link, social links
- Keep dark to match the cinematic aesthetic

### 6. Mobile Considerations

The Phaser canvas scales via FIT mode but is designed for landscape 16:9. On portrait mobile:
- Option A: Show a "rotate your phone" prompt (quick, many games do this)
- Option B: Show a static hero image with the ninja + key copy instead of the interactive cinematic, with the lead capture form below
- Option C: Let it letterbox (works but small)

### 7. Performance Notes

- The Phaser bundle is ~500KB gzipped. Use `client:only="react"` to avoid SSR.
- Consider lazy loading the cinematic section (intersection observer)
- The cinematic has zero API calls — purely client-side animations
- Font "Press Start 2P" should have `display: swap` to avoid FOIT

---

## File Origins

All files in `src/phaser/` and `src/components/game/PhaserGame.tsx` come from:
- **Source repo**: `sfc-dashboard` (private)
- **Source path**: `resources/js/Phaser/`
- **Branch**: `feature/sentry-integration` (worktree: `onboarding-flow`)

The scenes are identical to the app's onboarding Act 1. If the onboarding scenes are updated in the dashboard repo, these files should be synced.
