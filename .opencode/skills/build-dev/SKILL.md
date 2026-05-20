---
name: build-dev
description: Use when the user asks to build, lint, run dev server, preview, or type-check this Vite + React + TypeScript project. Commands use npm scripts defined in package.json.
---

# Build & Dev Commands

## Dev server
```bash
npm run dev
```
Starts Vite dev server with `--host` flag (LAN access). HMR enabled.

## Type-check + build
```bash
npm run build
```
Runs `tsc -b` first, then `vite build`. Output goes to `dist/`.

## Lint
```bash
npm run lint
```
Runs ESLint on the entire project.

## Preview production build
```bash
npm run preview
```
Serves the `dist/` folder locally for testing.
