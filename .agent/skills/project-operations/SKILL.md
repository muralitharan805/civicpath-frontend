---
name: project-operations
description: Practical procedures and exact commands to serve, build, test, lint, and format the civicPath-frontend codebase using pnpm.
---

# Project Operations Skill

This skill documents how to execute development tasks, builds, tests, and standard operations in this workspace.

> [!IMPORTANT]
> **This project uses `pnpm` for package and dependency management.**
> - Any agent executing commands or modifying dependencies **MUST** use `pnpm` (e.g., `pnpm install`, `pnpm add`, `pnpm add -D`).
> - Do **NOT** use `npm` or `yarn` under any circumstances to install packages or manage files.

## PNPM Scripts and Command Directory

The project includes standard scripts defined in `package.json` to manage development workflows.

| Task | Command | Description |
| :--- | :--- | :--- |
| **Start Dev Server** | `pnpm start` | Serves the application locally on `http://localhost:4200/` with hot reloading. |
| **Build Production** | `pnpm build` | Builds the application in production mode, outputting optimized artifacts. |
| **Build Watch** | `pnpm watch` | Builds in development mode and watches for changes. |
| **Run Unit Tests** | `pnpm test` | Executes unit tests via Vitest (as configured in the builder config). |

---

## Technical Details & Specific Operations

### 1. Serving the Application Locally
To start the Angular v21 development server, run:
```bash
pnpm start
```
By default, the server is available at `http://localhost:4200/`. When running in background or automated flows, verify that no port collisions occur, and monitor terminal outputs.

### 2. Building for Production
To perform a full build validation (especially before commits or deployment verification), run:
```bash
pnpm build
```
This builds optimized bundles and enforces budget checks specified in `angular.json`:
- **Initial bundle budget**: Warning at `500kB`, Error at `1MB`.
- **Component style budget**: Warning at `4kB`, Error at `8kB`.

### 3. Unit Testing with Vitest
Testing in this project is powered by **Vitest** and **jsdom** (rather than Karma/Karma-Jasmine).
To run unit tests in watch mode or single execution:
```bash
pnpm test
```
Or run Vitest directly via pnpm exec:
```bash
pnpm exec vitest
```
Verify that all specs match the standard standalone imports pattern. Spec files are named `*.spec.ts`.

### 4. Code Formatting with Prettier
To maintain a clean and standardized style matching the workspace `.prettierrc`, run formatting checks or auto-formatting:

- **Format all source files**:
  ```bash
  pnpm exec prettier --write "src/**/*.{ts,html,scss}"
  ```
- **Check formatting without modifying**:
  ```bash
  pnpm exec prettier --check "src/**/*.{ts,html,scss}"
  ```

---

## Package Installation Cheat Sheet

When adding or updating dependencies, agents must use the following commands:

* **Install all dependencies**:
  ```bash
  pnpm install
  ```
* **Add a runtime dependency**:
  ```bash
  pnpm add <package-name>
  ```
* **Add a development dependency**:
  ```bash
  pnpm add -D <package-name>
  ```
* **Remove a dependency**:
  ```bash
  pnpm remove <package-name>
  ```
