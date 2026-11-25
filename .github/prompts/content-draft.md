# 🔁 AI Development Workflow — EURL ETB Achouri Toufik Website

This is the step-by-step pipeline for building and improving pages on this site.
Every step has an assigned AI tool, model, and prompt file.

*Updated July 2026 — model assignments refreshed after ~4 months.*

---

## Pipeline Overview

```
STEP 1 — Claude (claude.ai)
  Plan the page or task
  └─► Output: a filled Gemini prompt ready to paste into Antigravity

        ▼

STEP 1.5 — DeepSeek V3.2 (API) or Qwen 3.6 (free tier)
  Draft raw content: copy, service descriptions, boilerplate text
  └─► Output: rough content blocks, handed to Step 1 output or directly into Step 2 prompt
      Skip this step for pages that don't need new written content

        ▼

STEP 2 — Antigravity / Gemini 3.5 Flash
  Generate the full HTML page
  └─► Output: services.html or projects.html

        ▼  ⚠️ MANUAL HANDOFF
           Save the file into the workspace folder before continuing

        ▼

STEP 3 — Antigravity / Gemini 3 Pro
  Integrate the page into the site
  └─► Audits navbar, footer, links, CSS, scripts
      Opens browser and visually verifies (live browser testing)
  └─► Output: integrated page + output report

        ▼

STEP 4 — Antigravity / Gemini 3 Pro
  Fix responsiveness across all breakpoints
  └─► Tests 375px / 430px / 768px / 1024px / 1280px
      Fixes issues, re-verifies in browser
  └─► Output: responsive page + output report
      (Steps 3 and 4 can run in the same Antigravity session — no model switch needed)

        ▼  ⚠️ MANUAL HANDOFF
           Paste the output report into claude.ai

        ▼

STEP 5 — Claude (claude.ai)
  Review UX and layout
  └─► Reads the report, suggests improvements
      Writes targeted fix instructions
  └─► Output: instructions → back to Antigravity if needed
```

---

## Model Assignment

| Step | Tool | Model | Mode |
|------|------|-------|------|
| 1 — Plan | claude.ai | Claude Sonnet 5 | Conversation |
| 1.5 — Draft content | DeepSeek API or Qwen 3.6 (free tier) | DeepSeek V3.2 / Qwen 3.6 | Conversation |
| 2 — Generate | Antigravity | Gemini 3.5 Flash | Agent |
| 3 — Integrate | Antigravity | Gemini 3 Pro | Agent |
| 4 — QA | Antigravity | Gemini 3 Pro | Agent |
| 5 — Review | claude.ai (this chat) | Claude Sonnet 5 | Conversation |

> ⚠️ Always use **Agent mode** in Antigravity — not Planning mode.
> Planning mode asks permission before every action and breaks the autonomous flow.

> 💡 Steps 3 and 4 now share the same model (Gemini 3 Pro), so they can run as one
> continuous Antigravity session instead of two separate conversations — saves a handoff.

---

## Prompt Files Per Step

| Step | Prompt file | Location |
|------|------------|----------|
| 1 — New section | `component-gen.md` | `prompts/` |
| 1.5 — Content draft | *(not yet written — plain conversational prompt for now)* | `prompts/` |
| 2 — Services page | `gemini-prompt-services-page.md` | `prompts/` |
| 2 — Projects page | `gemini-prompt-projects-page.md` | `prompts/` |
| 3 — Integration | `antigravity-step3-integration.md` | `prompts/` |
| 4 — Responsiveness | `antigravity-step4-responsiveness.md` | `prompts/` |
| 5 — Layout review | `layout-improvement.md` | `prompts/` |
| Any — Bug fix | `bug-fix.md` | `prompts/` |
| Any — Responsive fix | `responsive-fixing.md` | `prompts/` |

---

## How to Run Each Step in Antigravity

### Step 1.5 — DeepSeek / Qwen (content draft)
1. Use DeepSeek's API (≈$0.27/M input tokens) or Qwen 3.6's free-tier chat
2. Prompt it directly with the raw facts (company history, services, project list)
3. Ask for rough copy in the target language(s) — don't expect final polish, just a solid first draft
4. Carry the output into Step 1's Gemini prompt, or paste directly into Step 2 if no further planning is needed

### Step 2 — Gemini 3.5 Flash (generation)
1. Open Antigravity → Agent Manager → new conversation
2. Set model: **Gemini 3.5 Flash**
3. Set mode: **Agent**
4. Paste the contents of `gemini-prompt-services-page.md` or `gemini-prompt-projects-page.md`
5. Let it run — it will write the full HTML file
6. Save the output file to the workspace folder

### Step 3 — Gemini 3 Pro (integration)
1. Open Antigravity → Agent Manager → new conversation
2. Set model: **Gemini 3 Pro**
3. Set mode: **Agent**
4. Start with: `Read @prompts/README.md first and follow all rules in it before doing anything.`
5. Paste the contents of `antigravity-step3-integration.md`
6. Replace `[target].html` with the actual filename (e.g. `services.html`)
7. Let it run autonomously — it will audit, fix, open the browser, and verify
8. Copy the output report

### Step 4 — Gemini 3 Pro (QA)
1. Continue in the same Antigravity conversation as Step 3 (same model — no need to restart)
2. Confirm model is **Gemini 3 Pro**, mode is **Agent**
3. Paste the contents of `antigravity-step4-responsiveness.md`
4. Replace `[target].html` with the actual filename
5. Let it run — it will test all 5 breakpoints, fix issues, and re-verify
6. Copy the output report → paste into claude.ai for Step 5

---

## Manual Handoff Points

There are two points in the pipeline where you need to take action:

**Handoff 1 — After Step 2**
Gemini 3.5 Flash generates the HTML. You save the file to the workspace folder so Gemini 3 Pro can access it in Step 3. Takes ~30 seconds.

**Handoff 2 — After Step 4**
Antigravity outputs a report of all fixes applied and anything flagged for design decisions. You paste that report into claude.ai so Step 5 can review it. Takes ~30 seconds.

> These are the only two manual steps in the entire pipeline.
> Everything else runs autonomously inside Antigravity.

---

## Multi-Agent Automation Status

Antigravity does not currently support agents supervising other agents automatically.
The two handoff points above are manual by necessity — not by design choice.
When Antigravity adds automatic agent chaining, these handoffs can be removed.

---

## Workflow for Bug Fixes and Improvements

Not every task needs the full 5-step pipeline. Use this shortcut for smaller tasks:

```
Bug found → use bug-fix.md in claude.ai → paste fix into Antigravity (Gemini 3 Pro)

Layout looks off → use layout-improvement.md in claude.ai → paste into Antigravity

Mobile broken → use responsive-fixing.md in claude.ai → paste into Antigravity
```
