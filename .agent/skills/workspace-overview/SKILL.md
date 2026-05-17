---
name: workspace-overview
description: Architectural map, key configuration files, and design system philosophy of the civicPath-frontend project.
---

# Workspace Overview Skill

This skill acts as the master guide to the architectural structure, entrypoints, and aesthetic goals of the `civicPath-frontend` project.

## Directory Structure

```
civicPath-frontend/
├── .agent/
│   └── skills/                   # Reusable workspace skills for agentic AI
├── .gemini/
│   └── GEMINI.md                 # Agent instructions (aligned with AGENTS.md)
├── src/
│   ├── app/                      # Angular standalone application logic
│   │   ├── app.config.ts         # Global app configurations and providers
│   │   ├── app.routes.ts         # Application lazy routing definitions
│   │   ├── app.ts                # App root component controller (signal-based)
│   │   ├── app.html              # App root component structural template
│   │   └── app.scss              # App root styling
│   ├── index.html                # Entry HTML shell
│   ├── main.ts                   # Bootstrapping script
│   └── styles.scss               # Global styles & theme definitions
├── public/                       # Static public assets (images, fonts, etc.)
├── angular.json                  # Angular workspace building, test, and style configuration
├── tsconfig.json                 # Base strict-mode TypeScript compilation options
├── package.json                  # Dependencies, scripts, and runtime packages
└── README.md                     # General project documentation
```

---

## Core Technologies and Setup

- **Core Framework**: Angular v21.2.0 (using modern standalone routing, signals state, custom templates, and SCSS).
- **TypeScript Strict Mode**: Enforces `strict`, `strictTemplates`, `strictInjectionParameters`, and `strictInputAccessModifiers` for high-quality, type-safe development.
- **Styling Core**: Vanilla SCSS (Sass). The configuration automatically parses `.scss` inline and external files.
- **Unit Testing**: Powered by Vitest (`@angular/build:unit-test` target and `jsdom` context).

---

## Premium UI & Design Principles

When expanding this project, agents must create highly polished, interactive, and modern designs:

1. **Vibrant & Tailored Colors**
   - Avoid standard colors (like generic `#f00` red, `#00f` blue).
   - Use curated OKLCH or HSL-based harmonious palettes.
   - Utilize smooth gradients for high-fidelity interactive sections.

2. **Responsive Layouts**
   - Establish fluid grids, flex structures, and responsive styles for all mobile, tablet, and desktop viewports.
   - Never hardcode screen layouts; use CSS variables and custom media queries.

3. **Micro-Animations & Interaction**
   - Hover effects, active states, and focus states must have smooth transitions (e.g., `transition: all 0.3s ease`).
   - Add micro-animations (subtle scale, color transitions, card raises) to elevate the tactile quality of the interface.

4. **Typography & Layout Excellence**
   - Leverage modern typography (such as Inter, Outfit, or Roboto) instead of raw browser defaults.
   - Enforce pixel-perfect alignment, padding, and spacing variables to maintain visual consistency.
