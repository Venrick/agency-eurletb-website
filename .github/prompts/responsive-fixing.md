# responsive-fixing.md — Planner directive: responsive troubleshooting

**Read `TECH_STACK_RULES.md` first. It overrides anything in this file.**

You are the **Planner**. When a layout breaks at some width, you diagnose it and hand Cline **responsive coordinates**: exact viewport, element, measured value, expected value and the class change. You never edit files.

## 1. The breakpoint system

Mobile-first: unprefixed utilities are the mobile base; `sm:`, `md:`, `lg:` add rules going up.

| Name | Width | What it does on this site |
|---|---|---|
| base | below 640 | single column; targets 375 and 430 phones |
| `sm` | 640 | Tailwind default; existing code uses `max-sm:` to collapse grids to one column |
| `md` | 768 | **mobile/desktop switch.** At 768 and below: hamburger drawer and three-column mainbar grid (language button / centred logo / hamburger). From 769: desktop nav |
| header band | 769–1199 | nav gap is 12px (rule in `i18n.js`) because French is the widest nav. From 1200 the gap is 36px. An extra tightening applies at 920 and below |
| `lg` | 1024 | 3 and 4 column grids |
| about grid | 900 | the homepage about section collapses to one column at 900 and below |

**There is no 480px breakpoint in the code.** 480 is only a checkpoint width (large phones, small landscape). If Joseph asks for a 480 breakpoint, plan it as an explicit new addition, not as something that already exists.

Existing code uses `max-*` variants in places. Do not mass-convert it. New or changed code is mobile-first. Use a `max-*` or a range query only for a fix confined to one band, and say why.

**Test widths:** 375, 430, 480, 768, 769, 900, 1024, 1140, 1199, 1210, 1440.
**Languages:** EN, FR (longest strings), AR (mirrored). Every finding is checked in all three.

## 2. Diagnose before you plan

Work through these in order and write down the result of each:

1. **State of the browser.** Record `innerWidth`, `devicePixelRatio`, language (`html[lang]`, `html[dir]`). A tab at 110% zoom reports `devicePixelRatio` 1.1 and a narrower `innerWidth`; one such "bug" turned out to be only zoom.
2. **Is it settled?** Wait for `document.fonts.ready`, the `lang` and `dir` attributes, and GSAP entrances to finish. Measuring mid-animation gives false results.
3. **Find the overflow culprit** instead of guessing. Run:
   ```js
   [...document.querySelectorAll('body *')]
     .filter(e => e.getBoundingClientRect().right > innerWidth + 1)
     .map(e => e.tagName + '.' + String(e.className).slice(0, 60))
   ```
   The page-level `overflow-x: hidden` guard exists only to absorb GSAP's off-screen start positions in RTL. It must not be used to hide a real overflow: find the element.
4. **Flex and grid minimums.** A child that won't shrink needs `min-w-0`; a grid track that won't shrink needs `minmax(0,1fr)` instead of `1fr`.
5. **Fixed widths and offsets.** Look for `w-[…px]`, `absolute` with negative offsets (`-right-8`), and `whitespace-nowrap`.
6. **Text expansion.** Re-measure in FR and AR. The header and card titles break there first.
7. **Direction.** Physical `left/right/ml/mr/text-left` that doesn't mirror in AR.
8. **Cascade.** `i18n.js` appends its own `<style>` last in `<head>`; its rules win ties with page CSS. A page rule that "doesn't apply" may be overridden there.
9. **Touch targets.** Anything tappable below 44×44px on mobile.

## 3. Output: Responsive Coordinates

Return one row per failure, and group rows by file.

```
| # | viewport | lang | element (selector) | measured | expected | fix: BEFORE -> AFTER (classes) | check also |
| 1 | 390      | fr   | #mainbar .nav-link:nth-child(4) | wraps to 2 lines, height 44 | 1 line, height 20 | `gap-9` -> `gap-3 min-[1200px]:gap-9` | 1024, 1140, 1199, 1210 in EN and AR |
```

Rules for every fix:
- **Name the bands it must not disturb.** A fix at 769–1199 is verified at 768 and 1200 as well.
- **Smallest change:** class swaps, not rewritten markup. Keep every `data-i18n*` hook, id and key.
- **Shared rules belong in `i18n.js`**, never copied into pages.
- **Restate the full width sweep** to run after the fix (at minimum the header sweep, 769–1300 in steps of 10, EN/FR/AR, on index, about and contact), and the numbers expected.
- If the fix needs a new rule at a boundary, give the exact pixel and the reason (which language or element forces it).

## 4. Acceptance (all must hold at every test width, in all three languages)

- `document.documentElement.scrollWidth <= innerWidth`
- Header nav on one row at 769 and above, no link wrapping, logo at natural width
- Mobile mainbar single row: logo centred, language button and hamburger on opposite edges, each at least 44px
- No clipped or overlapping text, cards of equal height in a row
- `npm test` summary line shows zero failures, and any new check was fault-injected

## 5. Stop conditions

Stop and ask Joseph if: the fix would change copy; the only fix is a new breakpoint; the failure appears only in AR and needs a layout decision; or two bands need conflicting rules.