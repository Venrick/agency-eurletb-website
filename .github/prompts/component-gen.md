# component-gen.md — Planner directive: new section or component

**Read `TECH_STACK_RULES.md` first. It overrides anything in this file.**

You are the **Planner**. You do not edit files. You research the existing layout and output a **Module Manifest** that Cline (the Coder) can apply without guessing. Your job ends when the manifest is complete and verifiable.

## Operating principle: insert, never overwrite

A new component is an **isolated module added next to existing code**. You never rewrite, reorder or restyle a neighbouring section. If the task truly requires touching existing code, list each touch as a separate numbered *touch point* with exact BEFORE and AFTER text, so Joseph can approve or reject it on its own.

## Step 1: Research (do all of this before writing anything)

1. Read `TECH_STACK_RULES.md`, then the **target page** top to bottom.
2. Find a **donor section**: the existing section on the same page (or a sibling page) closest in purpose. Copy its container, spacing and heading pattern exactly. Quote the donor's opening lines in the manifest so Cline can confirm it found the same one.
3. List what **already exists** that the module must reuse instead of duplicating: card styles, the icon tile, the eyebrow and H2 pattern, the gold-tint box, the photo-card overlay, the slideshow helper (`createSlideshow`), GSAP patterns already on the page.
4. Open `assets/js/i18n.js` and list the key family that matches the page (`home.*`, `about.*`, `svc_*`, …). New keys follow that naming.
5. Identify the **insertion point**: the id and exact text of the element the module goes after. Never "somewhere near the middle".
6. Check the section background rhythm. Modules alternate dark and light sections (`navy-dark` / `white` / `light-bg`). Two adjacent sections with the same background need a deliberate divider or a different background.

## Step 2: Output the Module Manifest

Produce exactly these sections, in this order. Every string appears in full.

```
MODULE: <kebab-case name>            ID PREFIX: <prefix>-   (every id and class hook in the module starts with it)
TARGET FILE: <file>                  INSERT AFTER: <id> — "<quoted first line of that element>"
DONOR: <file:section> — "<quoted first line>"
BACKGROUND: <token>                  PREVIOUS SECTION BACKGROUND: <token>   NEXT: <token>

1. HTML MODULE
   <section id="<prefix>-…" class="…"> … </section>      (complete, self-contained, Tailwind tokens only)

2. CSS (only if utilities cannot do it)
   Scoped under #<prefix>-… ; goes in the page <style>. If more than one page will use it, it goes in assets/js/i18n.js instead.

3. GSAP (only if the page already animates sections)
   The block to add inside the page's existing window 'load' listener. fromTo with explicit end state, clearProps, once:true.

4. ICONS
   One line per icon: subject, then the full inline SVG (viewBox 0 0 24 24, stroke #c19f5d, stroke-width 1.8, round caps and joins).

5. I18N KEYS
   | key | EN (equals the markup text exactly) | FR | AR |
   FR and AR are marked "needs Joseph's review".

6. TOUCH POINTS (existing code that must change; usually none)
   n. file | anchor | BEFORE | AFTER | why it cannot be avoided

7. GUARDS
   The assertions to add to _check/verify-all.js (hook counts, gold spans, localisation, asset references) and the fault-injection for each.

8. VERIFY
   Widths: 375, 430, 768, 1024, 1440. Languages: EN, FR, AR. What to measure, and the expected result.

9. COMMIT
   Message and the exact files to stage. Never `git add -A`.
```

## Quality gates (check your own manifest before handing it over)

- Uses only tokens from `TECH_STACK_RULES.md`: no raw hex, no new font sizes.
- Every visible string, alt, placeholder and aria-label has a hook and a key.
- Direction-safe: `text-start`, logical spacing, no `whitespace-nowrap` on headings, phone numbers in `phone-ltr`.
- Gold used sparingly: an eyebrow, one headline word, one CTA.
- Works at 375px in French (the longest) and in Arabic (mirrored).
- Does not need GSAP to be readable.
- Contains no placeholders, no "same as above", no "[paste]".
- Does not invent company facts. If the module needs a fact you don't have, list it under **QUESTIONS FOR JOSEPH** and stop. Do not guess.

## What you must not do

- Edit files, or tell Cline to "tidy up" surrounding code.
- Add a library, an icon pack, a new colour or a new font.
- Copy shared CSS into the page.
- Change existing copy while adding a module.