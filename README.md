# Works Lab

[![Deploy to GitHub Pages](https://github.com/Anuragdhale27/works-lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/Anuragdhale27/works-lab/actions/workflows/deploy.yml)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fresume.workslab.in&label=resume.workslab.in)](https://resume.workslab.in)
[![Last commit](https://img.shields.io/github/last-commit/Anuragdhale27/works-lab)](https://github.com/Anuragdhale27/works-lab/commits/main)
[![Open issues](https://img.shields.io/github/issues/Anuragdhale27/works-lab)](https://github.com/Anuragdhale27/works-lab/issues)
[![Open PRs](https://img.shields.io/github/issues-pr/Anuragdhale27/works-lab)](https://github.com/Anuragdhale27/works-lab/pulls)

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Router 7](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-package_manager-000000?logo=bun&logoColor=white)
![Vitest](https://img.shields.io/badge/tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/lint-ESLint-4B32C3?logo=eslint&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/hosted_on-GitHub_Pages-222222?logo=githubpages&logoColor=white)

![Templates](https://img.shields.io/badge/resume_templates-6-0E7A5A)
![Price](https://img.shields.io/badge/price-%E2%82%B9149_one--time-0E7A5A)
![No backend](https://img.shields.io/badge/data-stays_in_your_browser-0E7A5A)
![ATS](https://img.shields.io/badge/PDF-real_selectable_text-0E7A5A)

Works Lab is a resume builder for the Indian job market: ATS-friendly resume templates, a guided
form with a live A4 preview, and PDF or Word export, all for a one-time payment with no
subscription.

**Live site:** https://resume.workslab.in

## Latest updates

**Builder** (PRs #6 and #19)
- Bullet points in work experience, projects and custom sections, with an "• Add bullet" button
  and Enter-to-continue lists. Bullets print as real lists, so ATS parsers read them as text.
- Undo / Redo with toolbar buttons and Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z.
- "Currently work here" / "Currently studying" checkboxes, plus move up / move down and
  duplicate on every entry.
- New sections: Awards & Achievements and user-defined custom sections (e.g. Volunteering,
  Publications).
- Section order panel to rearrange sections, with a reset to the default order.
- Accent colour picker with 8 presets, all readable on white and on the dark header bands.
- Word (.docx) export with real headings and bullet lists. The export code only downloads when
  someone clicks the button, so the page stays fast.

**Templates** (PR #6)
- Two new two-column templates, Sidebar and Split, bringing the total to six.

**ATS / PDF fixes** (PR #19)
- The name, title and contact line now come first in the PDF text in every template.
- Section headings no longer extract letter by letter ("P R O F E S S I O N A L").

**SEO** (PR #20)
- Every public page is generated as its own HTML file at build time, so it returns HTTP 200
  instead of GitHub Pages' 404 fallback and can be indexed.
- Unique titles, descriptions, canonical URLs and social-share tags per page, plus
  `robots.txt`, `sitemap.xml` and JSON-LD structured data (no invented ratings or reviews).
- Template pages list who each template suits, its features, an honest ATS note and links to
  the other templates.

## Features

- **Six templates**, all driven by one registry, so the builder, the homepage gallery and the
  template pages stay in sync.
- **Live A4 preview** with page-break lines, a notice when the resume runs past one page, and Fit/50/75/100% zoom.
- **Guided form**: section navigator with completion status, writing hints, a completeness
  meter, "Load example resume" and "Clear everything".
- **Autosave** to the browser, with an honest saving indicator.
- **Export**: PDF through the browser's print pipeline (real text, not an image), Word (.docx),
  and JSON export/import to move a resume between browsers.
- **Photo upload** (optional) for templates that show one.
- **Mobile friendly**: Edit / Preview toggle and no horizontal scrolling on phones.

## Templates

| Template | Layout | Best for |
| --- | --- | --- |
| Modern ATS | Single column, bold header band | Software / IT / Tech |
| Classic ATS | Single column, serif | Corporate / Finance / Operations |
| Minimal ATS | Single column, spacious | Freshers / Students |
| Executive ATS | Single column, Playfair Display name | Experienced professionals |
| Sidebar ATS | Two columns, sidebar on the left | Tech / Product / Design |
| Split ATS | Two columns, full-width header | Business / Marketing / Sales |

The single-column templates are the safest choice for applicant tracking systems. In the
two-column templates the main content comes first in the PDF, but some layout-aware parsers
may still mix the columns.

## How the PDF stays ATS-readable

PDF export uses `window.print()` on a print-only copy of the resume (`#print-root`, a direct
child of `<body>`), styled with `@media print` rules in `src/styles/global.css`. The browser
writes every field as real, selectable text. Template CSS avoids the things that break text
extraction order: `opacity` on text, wide `letter-spacing`, tables and text inside images.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the dev server and build
- [react-router-dom 7](https://reactrouter.com/) (`BrowserRouter`)
- Plain CSS with custom properties (no CSS framework)
- [docx](https://docx.js.org/) for Word export, loaded on demand
- [bun](https://bun.sh/) as package manager and script runner (not npm or yarn)
- [ESLint](https://eslint.org/), [Vitest](https://vitest.dev/) and Testing Library

There is no backend. Resume data lives in the browser's `localStorage`
(key `workslab_resume_data`) and is never sent to a server.

## Getting started

```bash
bun install
bun run dev        # start the Vite dev server
```

## Scripts

```bash
bun run dev        # dev server with hot reload
bun run build      # type-check, production build to dist/, then generate per-route HTML,
                   # 404.html and sitemap.xml (scripts/prerender-routes.ts)
bun run preview    # preview the production build locally
bun run lint       # ESLint
bun run test:run   # run the Vitest suite once
bun run test       # Vitest in watch mode
```

Run `bun run lint`, `bun run test:run` and `bun run build` before opening a PR.

## Project structure

```
index.html                    Vite entry HTML (#root plus the body-level #print-root)
public/                       CNAME, favicon.svg, og-image.png, robots.txt
scripts/prerender-routes.ts   Post-build: per-route HTML with metadata, 404.html, sitemap.xml
src/
  App.tsx                     Routes, plus the route-metadata hook
  types/resume.ts             ResumeData shape shared by the builder, templates and exports
  templates/
    meta.ts                   Template data (name, best for, descriptions, features); no React
    index.ts                  TEMPLATES registry = meta + component
    *Template.tsx             One component per design (6)
    Description.tsx           Renders descriptions as bullet lists and paragraphs
  pages/                      Landing, Builder, TemplateDetail, Privacy, Terms, Refund, NotFound
  components/                 Nav, Footer, SectionNav, TemplateCard/Preview, Toast, etc.
  hooks/
    useHistoryState.ts        Undo/redo history for the builder
    useFadeIn.ts              Scroll reveal on the landing page
  lib/
    config.ts                 Payment link and price
    storage.ts                localStorage load/save and import validation
    sectionOrder.ts           Resolves the user's section order
    parseDescription.ts       Splits text into bullets and paragraphs
    exportDocx.ts             Word export
    completeness.ts           Section status and completeness meter
    sampleData.ts             "Load example resume" data
  seo/
    routes.ts                 Titles, descriptions and canonicals for every route
    useRouteMeta.ts           Updates head tags on client-side navigation
  styles/                     global.css (app + templates + print), landing.css
.github/workflows/deploy.yml  Lint, test, build and deploy to GitHub Pages on push to main
```

## Routing

- `/`: landing page
- `/builder`: resume builder (optionally `?template=<key>`); `noindex` and blocked in `robots.txt`
- `/template/:templateKey`: detail page for one template
- `/privacy`, `/terms`, `/refund`: policy pages
- anything else: not-found page

GitHub Pages only serves files, so the build writes one HTML file per route
(`dist/template/modern.html`, `dist/privacy.html`, …). GitHub Pages serves them at the clean
URLs with status 200. `dist/404.html` is the fallback for unknown URLs.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`: install with bun, lint, test, build, and
deploy `dist/` to GitHub Pages. `public/CNAME` keeps the custom domain.

## Configuration

- **Payment link and price:** `src/lib/config.ts` (`CONFIG.PAYMENT_LINK`, `CONFIG.PRODUCT_PRICE`).
- **Adding a template:** add its data to `src/templates/meta.ts` and a component in
  `src/templates/`, then register it in `src/templates/index.ts`. The builder, gallery, template
  page, page metadata and sitemap all pick it up automatically.
- **Page metadata:** `src/seo/routes.ts`.
