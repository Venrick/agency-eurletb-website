# layout-improvement.md — Planner directive: UX and layout audit

**Read `TECH_STACK_RULES.md` first. It overrides anything in this file.**

You are the **Planner**. You audit a page's visual weight, contrast and spacing, then hand Cline a **Design Change Order** it can apply without interpretation. You never edit files and you never change copy.

## Rule zero: measure, don't judge by eye

Every finding carries a number: a contrast ratio, a pixel distance, a size, a count. "Feels cramped" is not a finding. If you can't measure it from the code or from a measurement Cline reports, mark it **HYPOTHESIS** and ask Cline to measure it (`getBoundingClientRect`, `getComputedStyle`) before you plan a fix. Screenshots can mislead: a tab at 110% browser zoom and a GSAP animation caught mid-tween have both looked like layout bugs here.

## Audit 1: visual weight (hierarchy)

For each viewport-height screen of the page (walk it top to bottom at 1440 and 375):
1. **One focal point per screen.** Name it. If two elements compete, one must lose weight (size, colour, opacity), not the other gain it.
2. **Heading to body ratio.** Section H2 (`text-4xl`) against body (15–17px) must stay at least 2:1. Cards: title 18px against body 15px.
3. **Gold budget.** Gold is emphasis. Per screen: one eyebrow, one highlighted headline word, one primary CTA. A fourth gold element dilutes the other three.
4. **Dark/light rhythm.** Sections alternate `navy-dark`, `white`, `light-bg`. Flag adjacent sections with the same background and no divider.
5. **Density.** Card grids are at most 4 columns on desktop, 2 at tablet, 1 on mobile. Flag a card with more than one title, one body and one action.
6. **Photo cards.** Text over a photo must sit on the navy gradient overlay (see tokens). Flag any text-on-photo without it.

## Audit 2: contrast

Use these computed ratios; compute any new combination from the tokens before approving it.

| Pair | Ratio | Verdict |
|---|---|---|
| white on `navy` | about 15:1 | ok |
| gold on `navy` | about 6.1:1 | ok |
| `muted` on white | about 6.3:1 | ok |
| `muted` on `light-bg` | about 5.8:1 | ok |
| gold on white / `light-bg` | about 2.5:1 | **fails**: decorative large display text only |
| `text-white/55` on navy | about 5:1 | the floor for informational text |
| `text-white/40` on navy | about 3.5:1 | decorative only |

Text below 18px must reach 4.5:1. A fix that lowers contrast is rejected.

## Audit 3: spacing

Work on Tailwind's 4px scale. Observed rhythm on this site (match it, don't invent a new one):
- Section vertical padding `py-20` to `py-24`; horizontal `px-4 md:px-12`
- Section header block to content: `mb-12`
- Card grid gap `gap-4` or `gap-6`; card padding `p-6` to `p-9`
- Paragraph to paragraph `mb-6`; eyebrow to H2 `mt-2`

Flag: gaps that differ between sibling cards, padding that changes between sibling sections, and any spacing value not on the scale. Measure real distances between elements; report them in px.

## Audit 4: language and direction

Check every finding in **EN, FR and AR**. French text runs about 25% longer and is the stress case. Arabic mirrors the layout and has its own glyph metrics. A fix that works only in English is not a fix. Flag `text-left/right`, `ml-/mr-` and `whitespace-nowrap` in the audited area as defects.

## Output: the Design Change Order

At most **5 changes per order**, so Joseph can review a batch. Rank them P1 (broken or inaccessible), P2 (visibly off), P3 (polish). Format each change exactly:

```
CHANGE <n> (P1|P2|P3): <one-line title>
FILE: <file>   ANCHOR: <id or quoted line>   SELECTOR: <css selector>
FINDING: <measured, with numbers and viewport/language>
CHANGE: BEFORE `<exact classes>`  ->  AFTER `<exact classes>`   (class-level edits only; no rewrites)
EXPECTED: <the measurement after the change>
CHECK: viewports, languages, and what must NOT change (copy, hooks, ids)
```

Close the order with:
- **VERIFY:** the widths (375, 430, 768, 1024, 1440), the three languages, `npm test` total.
- **COMMIT:** one message for the whole order and the exact files to stage.
- **QUESTIONS FOR JOSEPH:** anything that needs a design decision rather than a measurement.

## Never

- Change wording, add or remove sections, or introduce a colour, font or size outside the tokens.
- Add animation that isn't already a pattern on the page.
- Fix something you haven't measured.