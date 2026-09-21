# Works Lab

Works Lab is a resume-builder site: ATS-friendly resume templates for the Indian job market, a
guided form that renders a live preview, and a PDF export via the browser's own print pipeline —
all for a one-time payment, no subscription.

**Live site:** https://resume.workslab.in (deployed via GitHub Pages, see `.github/workflows/deploy.yml`)

## Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — dev server and build
- [react-router-dom](https://reactrouter.com/) (`BrowserRouter`) for client-side routing
- PDF export via `window.print()` and a `@media print` stylesheet (`src/styles/global.css`) —
  the browser's own print pipeline produces a real, text-based, ATS-parseable PDF, not a
  rasterized image
- Plain CSS with custom properties for design tokens (no CSS framework)
- [bun](https://bun.sh/) as the package manager and script runner — not npm/yarn
- [ESLint](https://eslint.org/) + [Vitest](https://vitest.dev/) / Testing Library

There is no backend. All resume data lives in the browser's `localStorage`
(key `workslab_resume_data`) and is never sent to a server.

## Getting started

```bash
bun install
bun run dev       # start the Vite dev server
```

## Scripts

```bash
bun run dev        # dev server with HMR
bun run build      # type-check + production build to dist/ (also writes dist/404.html)
bun run preview    # preview the production build locally
bun run lint       # ESLint
bun run test:run   # run the Vitest suite once
bun run test       # Vitest in watch mode
```

Run `bun run lint`, `bun run test:run`, and `bun run build` before opening a PR.

## Project structure

```
index.html                   Vite entry HTML
public/CNAME                 GitHub Pages custom domain (resume.workslab.in)
public/favicon.svg
src/
  main.tsx                   React root
  App.tsx                    Router setup
  index.css                  Imports src/styles/global.css
  styles/global.css          Design tokens + all page/component styles
  types/resume.ts            ResumeData shape shared by the builder and templates
  templates/                 One component per resume design + the shared registry
    ModernTemplate.tsx
    ClassicTemplate.tsx
    MinimalTemplate.tsx
    ExecutiveTemplate.tsx
    index.ts                 TEMPLATES registry (name, "best for", description, component) —
                              the single source of truth used by the builder, the landing
                              page's template gallery, and the template detail page
    templates.test.tsx
  pages/
    Landing.tsx               /
    Builder.tsx                /builder — form + live preview + print-based PDF export
    TemplateDetail.tsx        /template/:templateKey
    Privacy.tsx                /privacy
    Terms.tsx                  /terms
    Refund.tsx                  /refund
  components/                 Nav, Footer, FaqAccordion, TemplateCard/Preview, Toast, etc.
  lib/                        config.ts (payment link), storage.ts (localStorage), sampleData.ts
  hooks/useFadeIn.ts           Scroll reveal effect used on the landing page
.github/workflows/deploy.yml  Builds and deploys dist/ to GitHub Pages on every push to main
```

## Routing

- `/` — landing page
- `/builder` — resume builder (optionally `?template=modern|classic|minimal|executive`)
- `/template/:templateKey` — marketing/detail page for a single template
- `/privacy`, `/terms`, `/refund` — legal pages

Because this is a single-page app on GitHub Pages, the production build copies `dist/index.html`
to `dist/404.html` so a hard refresh or direct link on a non-root route doesn't 404.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs dependencies with bun,
lints, tests, builds, and deploys `dist/` to GitHub Pages via `actions/upload-pages-artifact` +
`actions/deploy-pages`. The `CNAME` file in `public/` is copied into `dist/` by Vite so the
custom domain keeps working.

## Configuration

- Payment link and product metadata: `src/lib/config.ts` (`CONFIG.PAYMENT_LINK`).
- Resume templates: add a new file in `src/templates/`, then register it in
  `src/templates/index.ts` — the builder, landing gallery, and template detail page all pick it
  up automatically.

## Before launch

- Replace the payment link in `src/lib/config.ts` with your real checkout URL.
- Replace the placeholder testimonials on the landing page with real customer feedback (or remove
  the section) — they're intentionally left as marked placeholders.
