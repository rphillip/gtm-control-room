# GTM Control Room portfolio

A static, mobile-first portfolio for Ryan Sulapas. It presents healthcare go-to-market work as an observable data system: detect, normalize, qualify, route, activate, observe, and improve.

The application is React 19 + TypeScript + Vite. It has no backend, performs no browser-time Clay requests, and renders authored case studies together with a committed, sanitized Clay snapshot.

## Local development

Prerequisites: Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Vite prints the local URL. The development build uses `/` as its base path.

Run the checks independently:

```sh
npm test
npm run build
npm run test:e2e
```

`npm test` runs the Vitest unit and component suite. `npm run build` includes TypeScript checking and writes the static site to `dist/`. `npm run test:e2e` builds and serves the site under a simulated GitHub Pages project path, then runs Playwright at 320, 390, 768, and 1280 pixel widths plus keyboard, reduced-motion, forced-colors, zoom, asset, and metadata checks.

To inspect the production build locally:

```sh
npm run build
npm run preview
```

## Architecture

- `src/content/portfolio.ts` is the typed, authored portfolio source.
- `src/content/types.ts` defines case-study and public-snapshot contracts.
- `src/data/clay-snapshot.json` is the committed public data snapshot.
- `scripts/sync-clay.mjs` resolves the approved Clay resources, calculates aggregates, sanitizes them, validates the public schema, and atomically replaces the snapshot.
- `src/components/` renders the Control Room, system registry, and case studies without a client router.
- `public/` contains only local, publication-safe assets. Fonts are packaged through npm and emitted by Vite.
- `vite.config.ts` derives the GitHub Pages base path from `GITHUB_REPOSITORY`. During deployment, the verified Pages base URL is injected into canonical and Open Graph URL metadata through `VITE_SITE_URL`.
- `.github/workflows/deploy-pages.yml` tests, builds, uploads `dist/`, and deploys that artifact. It never contacts Clay.

If the snapshot cannot be loaded, authored content remains available and snapshot-backed registry counts fall back to an unavailable state.

## Refresh the Clay snapshot locally

Clay sync is a developer-only operation. Install the Clay CLI so `clay` is on `PATH`, authenticate with browser OAuth using `clay login`, and verify the selected user and workspace with `clay whoami`. Then run:

```sh
npm run sync:clay
npm test
npm run build
git diff -- src/data/clay-snapshot.json
```

The command wrapper allows only these read operations:

- `whoami`
- `workbooks list`
- `tables list`, `tables get`, `tables columns get`, `tables rows list`, and `tables query-live`
- `signals list` and `signals get`
- `functions list` and `functions get`
- `workflows list` and `workflows graph get`
- `campaigns list`

All other Clay commands are rejected. The sync selects named, expected resources; reduces them to approved aggregate counts and topology; rejects unknown or private fields; and writes only after validation succeeds. Authentication stays in the developer's local Clay CLI configuration. There is no `.env` file, Clay secret, runtime Clay dependency, or Clay step in GitHub Actions.

## Public-data boundary

Safe to commit:

- Authored case-study copy and explicitly sourced aggregate counts.
- Signal names, generalized types, active/error status, cadence labels, and input kind.
- The human-readable AutoTier contract.
- Approved workflow names, node names/types, and index-based edges.
- Sanitized diagrams or media that contain no record-level or workspace-private information.

Never commit:

- Contact or row-level company records, names, email addresses, phone numbers, or LinkedIn profile data.
- Clay workbook, table, row, signal, function, workflow, node, or other internal IDs.
- Raw Clay responses, private workspace URLs, prompts, credentials, authorization material, API keys, tokens, or passwords.
- `.env` files or local Clay configuration.

The sanitizer rejects forbidden keys, private-ID patterns, URLs, and credential-like strings. Review the generated diff anyway; automated checks complement human review.

## Add a future project

1. Add one `CaseStudyContent` object to `src/content/portfolio.ts`.
2. Add optional sanitized assets under `public/projects/<slug>/`.
3. Run `npm test && npm run build && npm run test:e2e`.
4. Confirm no internal Clay ID or contact-level record appears in the diff.

The object must supply a unique slug, title, problem, summary, observed or sampled metrics, stages, build log, failure notes, and reflection. Optional media must use a root-relative local path, useful alt text and caption, and explicit width and height; the rendering helper applies the correct Vite base path.

## Deploy to GitHub Pages

The workflow runs on pushes to `main` and by manual dispatch. The build job receives read-only repository and Pages access. The deployment job alone receives `pages: write` and `id-token: write`, targets the protected `github-pages` environment, and exposes the URL returned by the deployment action. Concurrent stale deployments are cancelled. The workflow contains no personal access token, repository secret, Clay credential, sync command, or third-party action.

Before the first deployment, create or select the GitHub repository and configure Pages to use **GitHub Actions** as its source. Push `main`; the workflow will:

1. Install locked dependencies and run the unit suite.
2. Read Pages metadata and build with a base path derived from `GITHUB_REPOSITORY`.
3. Inject the verified Pages base URL into canonical and `og:url` metadata.
4. Upload only `dist/` as the Pages artifact.
5. Deploy through the `github-pages` environment.

After deployment, verify the returned public URL, all three case studies, navigation and contact links, the mobile layouts, and the absence of private identifiers. A final HTTP request should return `200`. No final repository or Pages URL is hardcoded before that resource exists.

## Current evidence

The checked-in snapshot reports 5 active signals and 1 errored signal, 60 scored accounts, 27 captured new-hire events, and the documented healthcare market-map and activation workflow aggregates. These are observed workspace aggregates or explicitly labeled ten-row samples—not campaign outcomes or funnel conversion rates. The repository currently exercises 73 unit/component checks across 10 Vitest files and 9 Playwright browser checks. The release budget is less than 150 kB of compressed initial JavaScript, excluding locally bundled font files.
