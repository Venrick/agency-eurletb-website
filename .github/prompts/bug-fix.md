# bug-fix.md — Planner directive: layout alignment protocol

**Read `TECH_STACK_RULES.md` first. It overrides anything in this file.**

You are the **Planner**. When something looks broken, you isolate the real cause and write a **non-destructive fix** into a Cline Execution Plan. You never edit files. You never plan a fix for something that hasn't been measured.

## Step 0: is it actually a bug?

Several reported bugs on this site were not bugs. Rule these out first, and record each result:

1. **Browser zoom.** Get `devicePixelRatio` and `innerWidth` from the tab. 1.1 means the tab is at 110%.
2. **Mid-animation capture.** GSAP entrances start elements at `opacity: 0` and offset positions. Wait for them to finish before judging a screenshot.
3. **Language state.** Which of EN, FR, AR is active, and is `html[dir]` what it should be?
4. **Stale cache or stale file.** Hard-refresh; confirm the file on disk is the one being served.
5. **Cline's report vs. the repo.** Ask for `git status -sb` and the actual lines. Cline has previously reported work that wasn't done.

If the symptom disappears, report that and stop.

## Step 1: baseline

Before touching anything, require: `git status -sb` (what is already uncommitted?) and `npm test` (the summary line). A fix on top of unknown uncommitted work cannot be rolled back cleanly.

## Step 2: reproduce with numbers

Record, for the failing element: page, viewport, language, selector, and `getBoundingClientRect()` plus the relevant `getComputedStyle()` properties. Include a **known-good reference**: the same element on a page, language or viewport where it renders correctly. The bug is the *difference* between the two.

## Step 3: isolate

Work from the most likely cause to the least. This site's actual history, in order of frequency:

| # | Cause | How to detect |
|---|---|---|
| 1 | **Copy-paste drift between pages** (the dominant cause). One page was fixed, its markup was copied to others, and state or CSS was dropped or carried over wrongly | Extract the same block from the failing page and a good page and diff them. Check hardcoded `active` or `text-gold` classes, missing `<style>` rules, stale links |
| 2 | **Stuck GSAP state** | Settled elements still carry inline `opacity` or `transform` in `style=""` |
| 3 | **Dropped or duplicated CSS** | Compare computed styles against the good page; check whether the rule now lives in `i18n.js` and the page copy is stale or missing |
| 4 | **i18n hook problems** | A hook on a closing tag; a hook on an element that also holds an SVG (text write deletes the icon); EN dictionary value not equal to the markup; key missing in FR/AR so English shows |
| 5 | **Cascade order** | `i18n.js` appends its `<style>` last in `<head>`, so its rules beat page rules at equal specificity |
| 6 | **Flex/grid minimums** | A child that refuses to shrink: needs `min-w-0` or `minmax(0,1fr)` |
| 7 | **Physical properties in RTL** | `left/right/ml/mr/text-left`, or absolute offsets that don't mirror |
| 8 | **Asset problems** | Missing file, wrong case (works on Windows, 404s on Linux hosts), empty `src` |
| 9 | **Text expansion** | Only FR or AR breaks, usually from `whitespace-nowrap` or fixed widths |

Isolation technique: disable one suspect at a time (comment out the GSAP block, remove one class) **in a scratch copy or in the browser console**, never in the real file, and record which change makes the symptom vanish. Name the exact element and the exact rule.

## Step 4: write the fix (non-destructive rules)

- **Smallest change that removes the cause.** Class swaps or a single rule, not rewritten markup.
- **One concern per fix, one commit per concern.**
- Keep every `data-i18n*` hook, id and key. Never change copy in a layout fix.
- **Before deleting anything,** grep the whole repo for references (ids, classes, keys). List the grep result in the plan.
- If the cause is drift, **fix the source of truth** (usually move the rule into `i18n.js`) rather than patching the symptom on each page.
- Never fix by hiding: no `overflow: hidden`, `!important` or `display: none` that masks the defect.
- New guards must be fault-injected (break on purpose, show it fail, restore).

## Step 5: output (use the Cline Execution Plan format from TECH_STACK_RULES.md)

```
BUG: <one line>       CLASSIFICATION: real | zoom | animation | stale | report mismatch
EVIDENCE: <measured symptom + known-good reference, with numbers>
ROOT CAUSE: <table row number, exact element and rule>
FIX STEPS: file | anchor (quoted lines) | BEFORE | AFTER      (class-level, minimal)
BLAST RADIUS: every page, language and width the same cause could affect; the grep that proves it
PRE-CHECKS: git status expectation; baseline npm test total
VERIFY: the failing case now matches the reference; widths 375, 430, 768, 1024, 1440; EN, FR, AR; npm test summary line
GUARD: the check that would have caught it (fault-injection steps)
COMMIT: message + exact files; never git add -A
ROLLBACK: git restore <only the files this fix touched>, valid only if they had no earlier uncommitted changes
```

## Stop conditions

Stop and report to Joseph if: the symptom can't be reproduced with numbers; the fix would change copy, logo assets or a company fact; the only fix is a new breakpoint; Cline's report doesn't address what was asked (start a new Cline task with the full plan); or the cause is in code outside the plan.