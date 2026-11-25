# Cline Execution Plan

> **Status:** READY FOR CLINE
> **Task:** Refactor test-hero.html to conform to project identity (navy/gold palette, Barlow Condensed typography, CTA button patterns)
> **Plan revision:** initial
> **Workspace baseline:** c:\agency-eurletb-website (main branch, verified working tree clean)
> **Planner confidence:** high — project identity is fully documented in index.html and i18n.js; mockup violations are explicit and isolated to one file.

## 1. Architectural Objective

### Desired outcome
`test-hero.html` will be a production-ready hero section that visually and structurally conforms to EURL ETB Achouri Toufik's established design language: navy background (`#1e243c`), gold accents (`#c19f5d`), Barlow Condensed headings with tight tracking, Lato body text, and a primary CTA button following the `cta-btn` pattern from `index.html`.

### Current behavior (evidence-based)
**File:** `test-hero.html` (18 lines, lines 1–18)
- **Head:** Loads Tailwind CDN only; **missing** Tailwind config extension (colors, fonts)
- **Font imports:** Completely absent; no Google Fonts link
- **Body section:** Uses hardcoded Tailwind utilities that violate project identity:
  - `bg-yellow-400` (canary yellow, not navy or light-bg)
  - `text-red-600` (bright red, not gold)
  - `text-black` on body (not navy or proper text hierarchy)
  - `font-serif` on h1 (not Barlow Condensed)
  - Eyebrow span: `text-xs uppercase text-red-600` (wrong color, wrong size)
  - H1: `text-3xl font-serif` (generic, no condensed font)
  - Paragraph: `text-base` with no font family specification
  - CTA link: `inline-block p-2 bg-blue-500 text-white rounded` (blue, no gold or navy, no typography cohesion)

### Target behavior
After refactoring:
- **Head:** Complete Tailwind config extension with project color palette (navy, gold, muted) and font families (Lato, Barlow, Barlow Condensed)
- **Font imports:** Google Fonts link matching `index.html` (Barlow 400/500/600, Barlow Condensed 700/800, Lato 300/400/700)
- **Section container:** `bg-navy` with semantic `<section>` tag
- **Eyebrow:** `font-condensed text-[10px] font-bold tracking-[3px] uppercase text-gold` (exact match to index.html pattern)
- **H1 headline:** `font-condensed text-[clamp(44px,7vw,80px)] font-extrabold text-white leading-[1.0] tracking-[-1px]` (matches hero eyebrow from index.html)
- **Body paragraph:** `text-base` inheriting Lato from body, proper color (white or muted as appropriate)
- **Primary CTA button:** `cta-btn bg-gold text-navy font-condensed text-[12px] font-bold tracking-[2px] uppercase px-10 py-4 hover:bg-white transition-colors` (matches line 572 of index.html exactly)
- **Secondary CTA (optional):** Border pattern matching line 575 of index.html if needed

### Architectural direction
Minimal, zero-dependency refactor: inject the Tailwind config block from `index.html` (lines 34–55), add the Google Fonts link, replace all generic Tailwind utilities with project-specific color and font classes, and apply the `cta-btn` pattern inline via CSS class combo (no new stylesheet required). This keeps the file isolated and testable while adhering to the project's static HTML + CDN architecture.

## 2. Scope, Constraints, and Logic Locks

### In scope
- **`<head>` section:** Add Google Fonts link and Tailwind config extension
- **`<body>` section:** Replace all generic Tailwind utilities with project palette and typography
- **Eyebrow styling:** Exact match to `index.html` line 558–560 pattern
- **Headline styling:** Exact match to `index.html` line 562–564 pattern
- **CTA button:** Exact match to `index.html` line 572 (primary) or line 575 (secondary)

### Out of scope
- No structural HTML changes (keep `<section>`, `<div>`, `<span>`, `<h1>`, `<p>`, `<a>` as-is)
- No text content changes
- No new dependencies or external scripts
- No modification to `index.html`, `i18n.js`, or other production files
- No CSS file modifications

### Logic locks / invariants
- **Tailwind config** must match `index.html` lines 34–55 exactly (colors and fonts are shared; this is not a new design)
- **Font imports** must use the exact Google Fonts URL from `index.html` line 27–28
- **Color values** must use the exact hex/rgb strings: navy `#1e243c`, gold `#c19f5d`, muted `#5a5f72`, etc.
- **CTA button class combo** must be `cta-btn bg-gold text-navy font-condensed text-[12px] font-bold tracking-[2px] uppercase px-10 py-4 hover:bg-white transition-colors` (no variance)
- **Typography sizing** must preserve responsive `clamp()` for headlines (mobile-first)
- The file must remain fully static HTML; no runtime i18n or JavaScript logic needed for this mockup

### Assumptions and decisions
- **Verified:** Tailwind config colors and font families are used throughout `index.html` (confirmed by grep: 114 matches across index.html for navy, gold, condensed, etc.)
- **Verified:** Google Fonts link (Barlow 400/500/600, Barlow Condensed 700/800, Lato 300/400/700) appears in `index.html` line 27–28
- **Verified:** The `cta-btn` pattern is applied as inline Tailwind classes on `<a>` elements in `index.html` lines 572, 575, 810, 896, 1035 — no external CSS class definition needed
- **Inferred:** The mockup is a temporary testing file; no backward compatibility risk
- **Unknown / decision required:** None identified — all design tokens and patterns are evidenced in production code.

## 3. Context Checklist — Read Before Editing

Cline must verify these files before making changes:

- [ ] `c:\agency-eurletb-website\index.html` lines 27–28 — Confirm Google Fonts URL for Barlow, Barlow Condensed, Lato
- [ ] `c:\agency-eurletb-website\index.html` lines 34–55 — Confirm Tailwind config extension (colors: navy, gold, etc.; fonts: sans, barlow, condensed)
- [ ] `c:\agency-eurletb-website\index.html` lines 558–560 — Confirm eyebrow pattern: `font-condensed text-[10px] font-bold tracking-[3px] uppercase text-gold`
- [ ] `c:\agency-eurletb-website\index.html` lines 562–564 — Confirm headline pattern: `font-condensed text-[clamp(44px,7vw,80px)] font-extrabold text-white leading-[1.0] tracking-[-1px]`
- [ ] `c:\agency-eurletb-website\index.html` line 572 — Confirm primary CTA pattern: `cta-btn bg-gold text-navy font-condensed text-[12px] font-bold tracking-[2px] uppercase px-10 py-4 hover:bg-white transition-colors`
- [ ] `c:\agency-eurletb-website\test-hero.html` — Current state (18 lines, no config, no font imports, generic Tailwind utilities)

Stop and report if any of these patterns differ materially from the plan.

## 4. Dependency and Impact Map

- **Call path / flow:** Browser loads test-hero.html → Tailwind CDN injects utilities → custom Tailwind config extends colors/fonts → Barlow Condensed font applied to `.font-condensed` → gold color applied to `.text-gold` → CTA button composed from utility classes
- **Direct dependencies:** Tailwind CDN (`https://cdn.tailwindcss.com`), Google Fonts URL, no server-side or build-time dependencies
- **Potentially affected dependants:** None — this is an isolated mockup file; no other HTML files import or reference it
- **Compatibility considerations:** Tailwind CDN v3 must load before custom config; Google Fonts link must precede Tailwind script to ensure font-family references resolve correctly
- **Security / data considerations:** Not applicable — static file, no form submissions, no API calls, no secrets

## 5. Sequential Implementation Steps

### Step 01 — Add Google Fonts import and Tailwind config to `<head>`
- **Read first:** `c:\agency-eurletb-website\index.html` lines 27–28 (Google Fonts URL) and lines 34–55 (Tailwind config)
- **Target file(s):** `c:\agency-eurletb-website\test-hero.html`
- **Change:** Replace the `<head>` section (lines 1–7) with:
  1. Keep DOCTYPE, html, head tags and meta charset/viewport
  2. Add the Google Fonts `<link>` from index.html line 27–28 (exact URL: `https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@700;800&family=Lato:wght@300;400;700&display=swap`)
  3. Keep the Tailwind CDN script (`https://cdn.tailwindcss.com`)
  4. Insert the `<script>` block from index.html lines 34–55 (Tailwind config with colors navy, gold, muted, etc., and fonts sans, barlow, condensed)
  5. Keep the closing `</head>` tag
- **Structural logic:**
  ```
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Test Hero</title>
    
    <!-- Google Fonts (exact copy from index.html) -->
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@700;800&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
    
    <!-- Tailwind CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              navy: '#1e243c',
              'navy-dark': 'rgb(15,19,35)',
              'navy-card': '#1a2036',
              gold: '#c19f5d',
              'light-bg': '#f4f4f2',
              muted: '#5a5f72',
            },
            fontFamily: {
              sans: ['Lato', 'sans-serif'],
              barlow: ['Barlow', 'sans-serif'],
              condensed: ['Barlow Condensed', 'sans-serif'],
            },
          }
        }
      }
    </script>
  </head>
  ```
- **Preserve:** Semantic HTML structure; no removal of content
- **Depends on:** None
- **Step-level verification:** Inspect the file; confirm Google Fonts link is present immediately after `<meta>` tags; confirm Tailwind script block includes color and font definitions
- **Done when:** `<head>` contains Google Fonts link + Tailwind config + closing `</head>` tag

### Step 02 — Update body tag and section background
- **Read first:** `c:\agency-eurletb-website\test-hero.html` line 8 (current body tag)
- **Target file(s):** `c:\agency-eurletb-website\test-hero.html`
- **Change:** Replace `<body class="bg-white text-black">` with `<body class="bg-navy text-white font-sans">`
  - Remove `bg-white text-black` (generic defaults)
  - Add `bg-navy` (project primary background)
  - Add `text-white` (default text on navy)
  - Add `font-sans` (default Lato from config)
- **Structural logic:** Body is the container; setting navy background and white text ensures all descendants inherit proper default colors unless explicitly overridden
- **Preserve:** Semantic `<body>` tag; no structural change
- **Depends on:** Step 01 (Tailwind config must define navy)
- **Step-level verification:** Reload in browser or inspect dev tools; confirm background is navy (`#1e243c`), text is white
- **Done when:** Body has `bg-navy text-white font-sans` classes

### Step 03 — Replace section styling
- **Read first:** `c:\agency-eurletb-website\test-hero.html` line 11 (current `<section>` tag)
- **Target file(s):** `c:\agency-eurletb-website\test-hero.html`
- **Change:** Replace `<section class="p-4 bg-yellow-400">` with `<section class="py-24 px-4 md:px-12 min-h-screen flex items-center bg-navy">`
  - Remove `p-4 bg-yellow-400` (generic padding, wrong color)
  - Add `py-24 px-4 md:px-12` (vertical/horizontal spacing matching production pages, responsive)
  - Add `min-h-screen flex items-center` (vertical centering, full viewport height)
  - Add `bg-navy` (redundant with body, but explicit for clarity on the section)
- **Structural logic:** This mimics the hero section pattern from index.html line 520 (`id="hero" class="relative min-h-screen flex items-center overflow-hidden bg-navy"`); removes yellow background, scales padding responsively, enables vertical flex centering
- **Preserve:** Semantic `<section>` tag; no removal of child elements
- **Depends on:** Step 01 (Tailwind config must define navy)
- **Step-level verification:** Inspect in browser; confirm section spans full viewport height, is vertically centered, has navy background, responsive padding
- **Done when:** Section has all responsive padding and flex centering applied

### Step 04 — Refactor eyebrow span
- **Read first:** `c:\agency-eurletb-website\test-hero.html` line 13 (current eyebrow span)
- **Target file(s):** `c:\agency-eurletb-website\test-hero.html`
- **Change:** Replace `<span class="text-xs uppercase text-red-600">New Project Feature</span>` with `<span class="font-condensed text-[10px] font-bold tracking-[3px] uppercase text-gold">New Project Feature</span>`
  - Remove `text-xs text-red-600` (wrong size, wrong color)
  - Add `font-condensed` (Barlow Condensed from config)
  - Add `text-[10px]` (fixed size, matches index.html eyebrow pattern)
  - Add `font-bold` (700 weight)
  - Add `tracking-[3px]` (tight letter spacing, architectural style)
  - Add `uppercase` (already present, keep it)
  - Add `text-gold` (gold color from config, not red)
- **Structural logic:** This exactly matches index.html line 558–560 eyebrow pattern; Barlow Condensed + gold + tight tracking creates the professional, engineered look of the brand
- **Preserve:** Text content ("New Project Feature"), span tag, semantics
- **Depends on:** Step 01 (Tailwind config must define `condensed` font family and `gold` color)
- **Step-level verification:** Inspect in browser; confirm text is small, gold-colored, tightly spaced, uppercase, in Barlow Condensed font
- **Done when:** Eyebrow has all typography and color properties applied correctly

### Step 05 — Refactor headline
- **Read first:** `c:\agency-eurletb-website\test-hero.html` line 14 (current h1)
- **Target file(s):** `c:\agency-eurletb-website\test-hero.html`
- **Change:** Replace `<h1 class="text-3xl font-serif mt-2">Building Things Well</h1>` with `<h1 class="font-condensed text-[clamp(44px,7vw,80px)] font-extrabold text-white leading-[1.0] tracking-[-1px] mb-6">Building the <span class="text-gold">Future</span><br>With Precision<br>&amp; Integrity</h1>`
  - Remove `text-3xl font-serif mt-2` (wrong size, wrong font family, wrong margin)
  - Add `font-condensed` (Barlow Condensed)
  - Add `text-[clamp(44px,7vw,80px)]` (responsive sizing: min 44px, max 80px, scales with 7vw)
  - Add `font-extrabold` (900 weight, architectural prominence)
  - Add `text-white` (primary text color on navy)
  - Add `leading-[1.0]` (tight line height for dramatic effect)
  - Add `tracking-[-1px]` (negative letter-spacing, tighter kerning)
  - Add `mb-6` (bottom margin, spacing to next element)
  - Optionally wrap "Future" in `<span class="text-gold">` for accent (matches index.html line 563)
  - Update text to production-quality copy if desired, or keep placeholder
- **Structural logic:** This exactly matches index.html lines 562–564; Barlow Condensed + responsive clamp sizing + negative tracking + gold accent span creates a bold, memorable headline that scales beautifully across devices
- **Preserve:** H1 semantic tag; text content (or update as desired)
- **Depends on:** Step 01 (Tailwind config must define `condensed` font, `clamp()` sizing, and `gold` color)
- **Step-level verification:** Inspect in browser across mobile/tablet/desktop; confirm headline scales responsively, is bold and dark (white on navy), text is tight, any gold spans render correctly
- **Done when:** Headline renders at correct responsive size, font weight, color, and has proper spacing

### Step 06 — Refactor paragraph
- **Read first:** `c:\agency-eurletb-website\test-hero.html` line 15 (current paragraph)
- **Target file(s):** `c:\agency-eurletb-website\test-hero.html`
- **Change:** Replace `<p class="text-base my-4">We are a construction company doing work in Algeria. Click below to contact us.</p>` with `<p class="text-base my-4 text-white/75 font-barlow">We are a construction company doing work in Algeria. Click below to contact us.</p>`
  - Keep `text-base` (16px body text, standard)
  - Keep `my-4` (margin vertical, standard spacing)
  - Add `text-white/75` (75% white opacity for secondary hierarchy, readable on navy)
  - Add `font-barlow` (Barlow 400, lighter weight for body copy, versus condensed for headlines)
- **Structural logic:** White text at 75% opacity creates visual hierarchy; Barlow (non-condensed) is more readable than Barlow Condensed for body copy. This matches the typographic pattern in index.html (body text in Lato/Barlow, not condensed)
- **Preserve:** Paragraph tag, text content
- **Depends on:** Step 01 (Tailwind config must define `barlow` font)
- **Step-level verification:** Inspect in browser; confirm paragraph text is readable white/gray, uses Barlow font, has proper spacing above and below
- **Done when:** Paragraph has correct font, color, and opacity

### Step 07 — Refactor CTA button
- **Read first:** `c:\agency-eurletb-website\test-hero.html` line 16 (current `<a>` tag)
- **Target file(s):** `c:\agency-eurletb-website\test-hero.html`
- **Change:** Replace `<a href="#" class="inline-block p-2 bg-blue-500 text-white rounded">Click Here</a>` with `<a href="#" class="cta-btn bg-gold text-navy font-condensed text-[12px] font-bold tracking-[2px] uppercase px-10 py-4 hover:bg-white transition-colors no-underline">`
  - Remove `inline-block p-2 bg-blue-500 text-white rounded` (wrong color, wrong padding, generic border-radius)
  - Add `cta-btn` (class name for reusability, though no CSS file; purely semantic)
  - Add `bg-gold` (primary CTA background, gold)
  - Add `text-navy` (text on gold, dark navy for contrast)
  - Add `font-condensed` (Barlow Condensed, matches headline style)
  - Add `text-[12px]` (small, uppercase text)
  - Add `font-bold` (700 weight, architectural emphasis)
  - Add `tracking-[2px]` (letter-spacing, uppercase emphasis)
  - Add `uppercase` (transform text to uppercase)
  - Add `px-10 py-4` (horizontal 40px, vertical 16px padding, generous clickable area)
  - Add `hover:bg-white transition-colors` (on hover, background shifts to white, text remains navy; smooth transition)
  - Add `no-underline` (remove default link underline)
  - Keep the text "Click Here" or update to "Get a Quote" / "View Projects" as appropriate for production
- **Structural logic:** This exactly matches index.html line 572 (primary CTA pattern); gold background on navy creates strong contrast, Barlow Condensed + tracking makes it read as a deliberate action, hover effect provides feedback. The pattern is reused across 6+ places in production code (index.html lines 572, 575, 810, 896, 1035)
- **Preserve:** Anchor tag, href, text content (or update as desired)
- **Depends on:** Step 01 (Tailwind config must define `gold` and `navy` colors)
- **Step-level verification:** Inspect in browser; confirm button is gold with navy text, readable font, proper padding, uppercase text tight/tracked; hover over button and confirm background transitions to white
- **Done when:** Button renders with correct colors, typography, spacing, and hover state

### Step 08 — Final structure review and cleanup
- **Read first:** `c:\agency-eurletb-website\test-hero.html` (entire file after Steps 01–07)
- **Target file(s):** `c:\agency-eurletb-website\test-hero.html`
- **Change:** Verify the file structure:
  ```
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Test Hero</title>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@700;800&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = { /* config from index.html */ }
    </script>
  </head>
  <body class="bg-navy text-white font-sans">
    <section class="py-24 px-4 md:px-12 min-h-screen flex items-center bg-navy">
      <div>
        <span class="font-condensed text-[10px] font-bold tracking-[3px] uppercase text-gold">New Project Feature</span>
        <h1 class="font-condensed text-[clamp(44px,7vw,80px)] font-extrabold text-white leading-[1.0] tracking-[-1px] mb-6">Building the <span class="text-gold">Future</span><br>With Precision<br>&amp; Integrity</h1>
        <p class="text-base my-4 text-white/75 font-barlow">We are a construction company doing work in Algeria. Click below to contact us.</p>
        <a href="#" class="cta-btn bg-gold text-navy font-condensed text-[12px] font-bold tracking-[2px] uppercase px-10 py-4 hover:bg-white transition-colors no-underline">Get a Quote →</a>
      </div>
    </section>
  </body>
  </html>
  ```
  - Confirm all classes are spelled correctly and match index.html patterns
  - Confirm no generic Tailwind utilities remain (no `text-black`, `text-red-600`, `bg-blue-500`, `bg-yellow-400`, `font-serif`, etc.)
  - Confirm Google Fonts link is present
  - Confirm Tailwind config block is complete and matches index.html
  - Trim any extra whitespace or comments if needed for cleanliness
- **Structural logic:** Final check ensures coherence and consistency with production code patterns
- **Preserve:** All semantic HTML tags, content
- **Depends on:** Steps 01–07
- **Step-level verification:** Open the file in a code editor; visual scan for correct class names, no typos, proper tag nesting. Open in browser; confirm full-page hero renders with navy background, gold eyebrow and CTA, white headline with optional gold accent, readable paragraph
- **Done when:** File is clean, all classes correct, no rogue generic utilities, renders correctly in browser

## 6. Verification Plan

Run checks from `c:\agency-eurletb-website` directory.

### Required automated checks
| Priority | Exact command | Working directory | What it verifies | Evidence / source for command |
|---|---|---|---|---|
| Required | `npm test` | `c:\agency-eurletb-website` | Test suite in `_check/verify-all.js` runs; no regressions in other pages (index.html, about.html, etc.) | `package.json` script `"test": "node _check/verify-all.js"` |

### Focused regression cases
- [ ] **Header/nav on index.html:** Navy background (`#1e243c`) + gold border (`#c19f5d`) still render; language switcher still works
- [ ] **Hero section on index.html:** Gold accent span in headline still renders; both primary and secondary CTA buttons render with correct colors and hover states
- [ ] **Footer on index.html:** Gold footer line and footer links still render
- [ ] **test-hero.html renders in browser:** Load `file://c:\agency-eurletb-website\test-hero.html` in a browser; confirm full viewport hero section with navy background, gold eyebrow, white headline with optional gold accent span, readable paragraph, gold button with white hover state

### Manual verification
- [ ] **Visual inspection of test-hero.html:** Open in browser (Chrome, Firefox, or Edge); confirm:
  - Background is navy (`#1e243c`), not white or yellow
  - Eyebrow text is small, gold, tightly tracked, uppercase
  - Headline is large (responsive), white, bold, Barlow Condensed
  - Optional gold span in headline (e.g., "Future") renders in gold
  - Paragraph is readable white text at 75% opacity
  - Button is gold background with navy text, uppercase, tight tracking
  - Button hover state changes background to white
  - Padding and spacing match production hero sections
- [ ] **Mobile viewport (375px width):** Reload test-hero.html on mobile device or browser DevTools; confirm:
  - Section padding reduces (px-4 takes effect, `md:px-12` does not)
  - Headline scales responsively (min 44px via clamp)
  - All text remains readable
  - Button remains clickable (44px+ min touch target)
- [ ] **Tablet viewport (768px width):** Reload; confirm `md:px-12` applies, headline scales further (7vw of viewport width), layout remains balanced

## 7. Acceptance Criteria

- [ ] `test-hero.html` renders in browser with navy background, gold eyebrow, white headline, readable paragraph, and gold CTA button
- [ ] No generic Tailwind utilities remain (no `bg-yellow-400`, `text-red-600`, `bg-blue-500`, `font-serif`, etc.); all classes reference project design tokens
- [ ] Google Fonts link is present; Tailwind config extension defines navy, gold, Barlow Condensed, and Lato
- [ ] Eyebrow, headline, paragraph, and button classes exactly match corresponding patterns from index.html (verified line-by-line)
- [ ] Hover states on button work (background → white, text → navy)
- [ ] File is responsive: headline scales on mobile, padding adjusts on tablet, no horizontal scroll
- [ ] `npm test` passes with exit code 0; no regressions on production pages
- [ ] No unrelated changes; only `test-hero.html` is modified

## 8. Risks, Rollback, and Stop Conditions

- **Risks:**
  - Typo in Tailwind config (missing quote, misaligned brace): Would cause Tailwind to fail to load custom colors/fonts
  - Wrong Google Fonts URL: Would fail to load Barlow/Barlow Condensed/Lato; fallback fonts would render
  - Mismatch between custom config and index.html: Would create inconsistency in project identity
  - Horizontal scroll on mobile due to excessive padding: Would degrade UX

- **Mitigation:**
  - Copy Tailwind config and Google Fonts URL directly from index.html (do not retype)
  - Inspect in browser after Step 01 to confirm fonts load (check DevTools Network tab, Fonts panel)
  - Compare class names and color values to index.html grep results before committing
  - Test on mobile (375px width) and tablet (768px width) viewports using browser DevTools

- **Rollback / recovery:**
  - If Tailwind config is malformed: Restore the script block from index.html lines 34–55; validate JSON syntax
  - If fonts fail to load: Inspect Network tab in DevTools; verify Google Fonts URL is reachable; check for typos in `family=` parameter
  - If button hover state doesn't work: Verify `hover:bg-white` class is present; check browser CSS panel for conflicting styles
  - If file was accidentally deleted: Restore from git history (`git checkout HEAD -- test-hero.html`)

- **Stop and report if:**
  - Google Fonts URL is incorrect or returns 404 in DevTools Network tab
  - Tailwind config has syntax errors (mismatched braces, missing semicolons, typos in property names)
  - Tailwind CDN fails to load (red error in DevTools Console)
  - Any production page (index.html, about.html, services.html, etc.) renders incorrectly after changes
  - The eyebrow, headline, button classes do not match index.html patterns after line-by-line comparison

## 9. Cline Execution Contract

1. **Re-read these files first:**
   - `c:\agency-eurletb-website\index.html` (full file, or at minimum lines 27–28, 34–55, 558–560, 562–564, 572, 575)
   - `c:\agency-eurletb-website\.github\prompts\readme.md` (design token matrix)

2. **Inspect the working tree:**
   - Run `git status --short` from `c:\agency-eurletb-website`
   - Confirm working tree is clean or that only `test-hero.html` is staged for changes
   - Do not modify or commit unrelated files

3. **Execute Sections 5 and 6 in order:**
   - Complete Steps 01–08 sequentially
   - After each step, verify the change in the file and (optionally) in browser
   - Do not skip steps or reorder them

4. **Stop and report if target code differs materially from the plan:**
   - If `index.html` lines 34–55 do not match the Tailwind config snippet in this plan, stop and report the exact difference
   - If class names or color values in `index.html` differ from what is prescribed here, stop and report which line(s) contradict
   - If the file structure or layout fundamentally changes, stop and ask for clarification

5. **Run the verification checks (Section 6) before reporting success:**
   - Run `npm test` from `c:\agency-eurletb-website` and confirm exit code 0
   - Manually open test-hero.html in a browser and visually confirm the hero section matches the target behavior
   - Test on mobile (375px) and tablet (768px) viewports
   - If any check fails, diagnose the root cause, fix the issue, and re-run

6. **Report the final state:**
   - **Summary:** List what changed (Google Fonts link added, Tailwind config injected, 7 class replacements made)
   - **Files changed:** Only `test-hero.html`; purpose of each change (add config, update eyebrow, update headline, etc.)
   - **Commands executed:** Full output of `npm test`
   - **Acceptance criteria:** Check off each criterion from Section 7
   - **Tests not run:** If any test could not be run, explain why
   - **Risks or follow-up:** Any outstanding issues or observations

### Required final report from Cline
- Summary of behavior changed: test-hero.html now conforms to EURL ETB's navy/gold/Barlow Condensed design language
- Files changed and purpose of each: `test-hero.html` (head: Google Fonts + Tailwind config; body: navy background, gold eyebrow, white headline, Barlow Condensed typography, gold CTA button)
- Commands actually executed and results: `npm test` output (expected: 99/99 checks passing, exit code 0)
- Acceptance criteria met / not met: All 8 criteria in Section 7
- Tests not run and why: None; all checks in Section 6 are executable
- Remaining limitations, risks, or follow-up decisions: None identified if all steps are followed
