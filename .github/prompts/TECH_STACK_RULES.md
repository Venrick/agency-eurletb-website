# TECH_STACK_RULES.md — EURL ETB Achouri Toufik website

**Status: non-negotiable.** The Planner (Copilot Chat, read-only reasoning agent) and the Coder (Cline, editing agent) both read this file in full before proposing or making any change.

**How to use it**
- If a task conflicts with a rule here, **stop and tell Joseph**. Do not pick a side silently.
- If the repo contradicts this file, report the discrepancy with file and line. The repo is current reality and this file is the standard it is measured against. Never "fix" either one silently.
- Values below were taken from the live site. Verify a value in the code before using it for a pixel-level decision.

---

## 1. Stack

- Plain HTML pages in the repo root. **No framework, no bundler, no build step.** 13 pages (see the list in section 9).
- Tailwind CSS via CDN (`https://cdn.tailwindcss.com`), configured by an inline `tailwind.config` in each page's `<head>`, plus per-page `<style>` blocks for what utilities cannot express.
- GSAP 3.12.2 and ScrollTrigger 3.12.2 from cdnjs. Leaflet 1.9.4 on `projects.html` only.
- Google Fonts: Barlow Condensed, Barlow, Lato.
- Shared behaviour and shared CSS live in `assets/js/i18n.js`, loaded at the end of `<body>` on every page.
- **npm is dev tooling only.** `package.json` exists for `npm test` (`_check/verify-all.js`, puppeteer-core, headless Edge). Nothing from `node_modules` ships. Never add a runtime dependency.
- Environment: Windows and PowerShell. Pages are opened from `file://` during development; the test suite serves them over HTTP.

---

## 2. Design tokens

Use the Tailwind token names. Never type a raw hex where a token exists.

| Token | Value | Use |
|---|---|---|
| `navy` | `#1e243c` | header mainbar, primary dark sections, icon tiles |
| `navy-dark` | `rgb(15,19,35)` (`#0f1323`) | topbar, footer, deepest sections, map section |
| `navy-card` | `#1a2036` | cards and panels on dark sections |
| `gold` | `#c19f5d` | accent only: eyebrows, one highlighted headline word, borders, CTAs, icon strokes |
| `light-bg` | `#f4f4f2` | light sections |
| `muted` | `#5a5f72` | secondary text on light backgrounds |
| `white` | `#ffffff` | text on dark, `bg-white` sections |

Fixed recipes (reuse exactly):
- Gold tint box: `bg-[rgba(193,159,93,0.07)]` with a gold-tinted border
- Photo-card overlay: `bg-gradient-to-t from-[rgba(10,15,30,0.97)] via-[rgba(10,15,30,0.72)] to-[rgba(10,15,30,0.05)]`
- Header mainbar bottom edge: `border-b-[3px] border-gold`

**Contrast rules (computed from the tokens):**
- White on `navy`: about 15:1. Gold on `navy`: about 6.1:1. Both fine.
- `muted` on white about 6.3:1, on `light-bg` about 5.8:1. Fine for body copy.
- **Gold on white or `light-bg`: about 2.5:1. It fails.** Never use gold for text on light backgrounds except large decorative display text.
- Text on navy: `text-white/55` is the floor for informational copy. `text-white/40` and below is decorative only.

---

## 3. Typography

Families (confirm the mapping in the `fontFamily` block of the page's `tailwind.config`):
- `font-condensed` = Barlow Condensed: headings, eyebrows, buttons, uppercase labels
- `font-barlow` = Barlow: card titles and UI text
- `font-sans` = Lato: default body

There is no formal scale. These are the **sizes the live pages use**. Reuse them; do not introduce new sizes without Joseph's approval.

| Role | Classes observed |
|---|---|
| Hero H1 | `font-condensed text-[clamp(40px,6vw,64px)] font-extrabold leading-[1.1]`, one gold word in `<span class="text-gold">` |
| Section H2 | `font-condensed text-4xl font-bold` (white on dark, navy on light) |
| Eyebrow | `font-condensed text-sm tracking-[0.2em] uppercase text-gold` (small variant `text-[11px] tracking-[2px]`) |
| Lead paragraph (service overview) | `text-[17px] text-muted leading-[1.9] text-start max-w-[800px] mx-auto` |
| Hero subtext | `text-[15px] text-white/65 leading-[1.75]` |
| Section subtitle | `text-[15px] text-muted leading-[1.8]` |
| Card body | `text-[15px] text-muted leading-[1.7]` |
| Card title | `font-barlow text-[18px] font-semibold` |
| Footer | links `text-[13px]`, small `text-[12px]` to `[12.5px]`, copyright `text-[11.5px]` |

Floor: reading copy is never below 15px. Footer and legal text are never below 11.5px.
Arabic: `i18n.js` sets letter-spacing to 0 under `html[dir="rtl"]`. Never add tracking rules that override it, because tracked Arabic breaks letter joining.

---

## 4. GSAP standard

- All GSAP and ScrollTrigger code runs **inside one `window.addEventListener('load', () => { gsap.registerPlugin(ScrollTrigger); ... })`** per page. Never `DOMContentLoaded`.
- Entrances use `gsap.fromTo` with an explicit end state and `clearProps: 'all'`. **Never a bare `gsap.from` with `once: true` on grids or filterable cards.** That pattern left cards stuck half-transformed.
- Triggers: `once: true`; `start: 'top 82%'` for grids, `'top 78%'` for section headers. Tweens 0.55–0.65s, `ease: 'power2.out'`, stagger 0.1. Match the neighbouring section.
- Anything that reveals filtered or hidden items must reset them (`gsap.set(el, { clearProps: 'opacity,transform' })`) before showing them.
- Call `ScrollTrigger.refresh()` once after late content (video `loadeddata`, dynamically added images), with a 3s fallback and a guard against double calls.
- **The page must read correctly if GSAP never loads.** Nothing starts hidden through CSS or `opacity-0`. GSAP sets initial states.
- Animate wrappers, never text nodes that `i18n.js` rewrites.

---

## 5. Inline SVG standard

- Every icon is an inline `<svg>` with `viewBox="0 0 24 24" fill="none" stroke="#c19f5d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`.
- Feature icons sit in `w-14 h-14 bg-navy rounded-[4px] flex items-center justify-center`, with the svg at `w-7 h-7` (28px).
- **Content-matched.** The icon must depict the card's subject. Never reuse a generic glyph by position, and no two cards on a page share an icon.
- Geometry: all shapes within the 2–22 box, no clipped or stray fragments, `getBBox()` non-empty. Render at 3× (84px) and look at it before approving. If it reads as something else at card size, rebuild it.
- Decorative SVGs get `aria-hidden="true"`.
- **No icon fonts, no icon packs, no external sprites, no `<img>` icons from a CDN.**

---

## 6. i18n and RTL (applies to every visible string)

- **The English markup is the source of truth.** The EN dictionary value must equal the live markup text exactly. A guard enforces this.
- Every visible string, alt text, placeholder, `aria-label` and `title` carries a hook: `data-i18n`, `data-i18n-html` (for gold spans and `<br>`), `data-i18n-alt`, `data-i18n-placeholder`, `data-i18n-aria-label`, `data-i18n-title`.
- A new string needs EN, FR and AR keys with identical key sets. Reuse an existing key only when the English is byte-identical.
- Gold spans inside JS strings are written `class=\"text-gold\"`.
- Never write text directly into a node that also holds an SVG. Wrap the text in a `<span data-i18n>` so the SVG survives.
- Direction: use `text-start`, `ms-/me-/ps-/pe-`, `start-/end-` or `rtl:` variants. **Never `text-left/right` or `ml-/mr-` on translatable layout.** No `whitespace-nowrap` on headings: French runs about 25% longer than English.
- Phone numbers: `<span class="phone-ltr" dir="ltr">…</span>`, otherwise Arabic reverses the digit groups.
- Internal links carry `?lang=` through the rewriter in `i18n.js`. Anything that compares an `href` compares the **path only**.
- Arabic company name: **عاشوري توفيق**. Never أشوري or شوري.
- Shared CSS belongs in `i18n.js`, **never copied into individual pages**. Duplicated per-page CSS is how the footer animation was lost on nine pages.

---

## 7. Layout

- Horizontal padding is `px-4 md:px-12`. Never a bare `px-12`.
- Containers: `max-w-[1440px] mx-auto`. Section rhythm `py-20` to `py-24` desktop; card grids `gap-6`.
- Header mainbar is `h-[110px]`. Mobile (≤768px) is a three-column grid, `minmax(0,1fr) auto minmax(0,1fr)`: language button at the start edge, logo centred, hamburger at the end edge. Tap targets are at least 44px.
- Images use `object-cover` with an explicit height or aspect ratio. Text over a photo needs the navy gradient overlay.
- No horizontal overflow at any width: `document.documentElement.scrollWidth <= innerWidth`.

---

## 8. Bans

1. No framework, bundler, build step or runtime npm package.
2. **No new use of `localStorage` or `sessionStorage`.** The only allowed use is the existing language persistence in `i18n.js`, inside try/catch. The site must work when storage throws, because the language also travels in `?lang=`.
3. No external icon packs, icon fonts or icon CDNs. Inline SVG only.
4. No new third-party script or style hosts beyond Tailwind CDN, cdnjs (GSAP, Leaflet) and Google Fonts. No jQuery, no analytics.
5. No shared CSS or shared JS duplicated across pages.
6. No raw hex values where a token exists. No new fonts.
7. No hardcoded English in JavaScript-injected strings; use `window.i18nText(key)`.
8. No `text-left/right`, `ml-/mr-`, or `whitespace-nowrap` on translatable layout.
9. No invented company facts. Certifications, awards, years, addresses and project claims come from Joseph.
10. No remote image that has not been verified to load. Stock photos are placeholders; say so.
11. No exception lists in guards, and no weakening an existing check to make it pass.
12. Never touch the logo assets without Joseph's approval.

---

## 9. Agent contract

**Pages:** `index`, `about`, `services`, `projects`, `quality-hse`, `contact`, `service-residential-construction`, `service-commercial-buildings`, `service-industrial-works`, `service-renovation-retrofit`, `service-project-management`, `service-architectural-design`, and `service-template` (a template, deliberately unlinked and English-only).

**Planner** (read-only): reads the workspace, never edits a file, and outputs a **Cline Execution Plan** in this format:

```
PLAN ID / GOAL (one sentence)
PRE-CHECKS: git status expectation; baseline `npm test` total
STEP n: file | exact anchor (quote 1-2 existing lines) | BEFORE snippet | AFTER snippet
I18N KEYS: table of key | EN (verbatim from markup) | FR | AR   (FR/AR marked "needs Joseph's review")
GUARDS: any check to add, and how to fault-inject it
VERIFY: exact commands and measurements, widths, languages
COMMIT: message (type(scope): description) and the exact files to stage
ROLLBACK: git restore for the specific files touched (only if they had no earlier uncommitted work)
```
No placeholders, no "[paste here]", no "similar to above". Every string appears in full.

**Coder** (Cline): executes only what the plan states. If reality differs (line moved, text differs, file missing), **stop and report the mismatch**. Do not align either side silently. Then:
1. Run `npm test`. Report the summary line (`Total: N, Passed: N, Failed: N`), never just "green".
2. Any new guard is fault-injected: break it on purpose, show it fail with a clear message, restore, show it pass.
3. Show `git diff --stat` and grep output as evidence. "Verified" without evidence is a failure.
4. Git: stage named files only, **never `git add -A`**. One concern per commit. Commit only after Joseph approves. Never push unless asked. Push protocol: `git fetch origin`, confirm `origin/main` is an ancestor of `HEAD`, push without `2>&1`, verify with `git ls-remote origin refs/heads/main`.
5. No scratch, probe or screenshot files inside the repo.
6. Joseph reviews Arabic and French wording and does a manual browser pass for anything RTL or mobile. Green automated checks do not replace that.