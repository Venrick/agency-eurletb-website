# 🏗️ System Tech Stack Matrix — EURL ETB Achouri Toufik Website

Official website for EURL ETB Achouri Toufik, a construction company based in Ain Defla, Algeria.
This document serves as the absolute source of truth for the local application architecture. All agents must read this matrix to ensure no external, compiled, or server-side dependencies are introduced.

---

## 📁 1. Workspace Folder Structure

```text
eurletb/
├── index.html                  <── Production Homepage layout
├── about.html                  <── Production Profile layout
├── contact.html                <── Production Map/Contact form layout
├── services.html               <── Production Offerings matrix
├── projects.html               <── Production Active building grid
├── test-hero.html              <── Isolated testing mockup file
├── style.css                   <── Global custom styling overrides
├── scripts.js                  <── Global interactions engine
├── images/                     <── Local image visual placeholders and vectors
├── .github/
│   ├── agents/
│   │   └── plan.agent.md       <── Standalone @LocalPlanner engine configuration
│   └── prompts/
│       ├── tech-stack.md       <── THIS MATRIX (System Source of Truth)
│       ├── TECH_STACK_RULES.md <── Design tokens and interaction behaviors
│       ├── component-gen.md    <── Component design blueprint
│       ├── bug-fix.md          <── Debugging guidelines
│       ├── layout-improvement.md <── UX audit rules
│       ├── responsive-fixing.md  <── Breakpoint guidelines
│       └── CLINE_EXECUTION_PLAN.md <── Active shared memory manifest
```

---

## 🤖 2. Dual-Agent Integrated Workflow Pipeline

This site is built and maintained entirely using an integrated multi-agent pipeline running directly inside the same IDE workspace loop:

| Step / Role | Interface Panel | Active Agent / Engine | Operational Task |
| :--- | :--- | :--- | :--- |
| **1 — The Planner** | Right-Side Panel | VS Code Copilot Chat (`@LocalPlanner`) | Deep codebase context inspection, dependency tracing, and compiling the `.github/prompts/CLINE_EXECUTION_PLAN.md` file. **Strictly Read-Only.** |
| **2 — The Coder** | Left-Side Panel | Cline Sidebar Extension (`Act Mode`) | Reading the generated manifest, executing file edits, applying side-by-side visual diff checkmarks, and running local terminal validation checks. |

---

## 🏗️ 3. Core Environmental Architecture

| Layer | Environment Standard | Operational Context |
| :--- | :--- | :--- |
| **Runtime Engine** | Pure Static Browser Client | Runs directly via local file extraction (`file://` protocols) or lightweight local hosts. No Node.js production servers. |
| **HTML Standard** | HTML5 Semantic Layout | Must use explicit layout tags: `<section>`, `<header>`, `<article>`, `<nav>`, `<footer>`. |
| **CSS Compiler** | Tailwind CSS CDN (v3) | Injected via runtime browser script headers. No static tailwind.config.js build compiling steps allowed. |
| **JS Environment** | Vanilla ECMAScript 6+ | Pure client-side interactions. Framework frameworks (React, Vue, Angular) are strictly prohibited. |
| **Assets Engine** | Vector SVGs & Static URLs | Inline vector path structures only. Image media routes map to direct directories (`images/`). |

---

## 📦 4. Engine Registries & CDN Coordinates

Agents must utilize ONLY these verified runtime script layers inside the document `<head>` blocks. Do not upgrade, alter, or fetch alternative version URLs.

### 🎨 Tailwind CSS Framework Injection
```html
<script src="https://tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          navy:        '#1e243c',
          'navy-dark': 'rgb(15,19,35)',
          'navy-card': '#1a2036',
          gold:        '#c19f5d',
          'light-bg':  '#f4f4f2',
          muted:       '#5a5f72',
        },
        fontFamily: {
          sans:      ['Lato', 'sans-serif'],
          barlow:    ['Barlow', 'sans-serif'],
          condensed: ['Barlow Condensed', 'sans-serif'],
        },
      }
    }
  }
</script>
```

### ⏳ Animation Foundations (GSAP Engine)
```html
<!-- GSAP Core Library -->
<script src="https://cloudflare.com"></script>
<!-- ScrollTrigger Extension Plugin -->
<script src="https://cloudflare.com"></script>
```

---

## ⛔ 5. Rigid Workspace Restrictions & Bans

The following items are completely restricted from this codebase. Any agent attempt to generate or incorporate them constitutes a workflow violation:
* **NO Node Package Manager (`npm`, `yarn`, `pnpm`):** Do not generate `package.json`, `package-lock.json`, or expect `node_modules` resolutions. 
* **NO Module Bundlers:** No Webpack, Vite, Turbopack, or Babel setups. The workspace remains entirely composed of raw static source files.
* **NO Third-Party Icon Packages:** FontAwesome, Lucide, and Boxicons CDN tags are banned. Codebase relies strictly on **Inline SVG elements**.
* **NO Application State Persistences:** All `localStorage` or `sessionStorage` references are intentionally banned to maintain stateless speed profiles.
