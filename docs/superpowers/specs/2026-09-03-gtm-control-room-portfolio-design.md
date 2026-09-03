# GTM Control Room Portfolio — Design Specification

Date: 2026-09-03

## Purpose

Build a fast, mobile-first React portfolio for Ryan Sulapas that demonstrates a specific positioning within 30 seconds:

> Ryan is a data-native GTM engineer for healthcare companies who treats go-to-market problems as data-system problems and works on the deeper engineering layer: source data, signals, integrations, scoring, routing, automation, and reliability.

The site must present real systems and decisions rather than a resume-shaped list of tools. It will use sanitized evidence from Ryan's Clay workspace and factual career context from his data-engineering and GTM-engineering resumes.

## Audience and Success Criteria

Primary audience: hiring managers and technical GTM leaders viewing the site first on a phone.

The first screen must communicate Ryan's wedge, healthcare focus, and engineering depth without requiring the phrase “GTM wedge.” Within two minutes, a reader must be able to identify at least two systems Ryan built, the data sources and transformations involved, a measurable result, and one failure or limitation Ryan learned from.

The finished release must:

- Load as a static GitHub Pages site at a public URL.
- Render cleanly from 320 px mobile widths through large desktop displays.
- Meet accessible keyboard, focus, contrast, and reduced-motion requirements.
- Keep Clay credentials, contact-level records, company-confidential data, and internal resource identifiers out of the client bundle and repository.
- Allow a future project to be added by creating one typed content entry and optional media assets.
- Include no fabricated campaign performance or project metrics.

## Concept: The GTM Control Room

Ryan's recent career is the design system: more than four years building cloud data platforms across startup and digital-health environments, followed by a deliberate move toward GTM engineering. The portfolio presents GTM as an observable data system:

`detect → normalize → qualify → route → activate → observe → improve`

The memorable, Ryan-only interaction is the **GTM Control Room**. It is an interactive systems diagram, not a decorative animation. Visitors can toggle data sources and follow an anonymized record through signals, the AutoTier function, segmentation, research, and activation. Each stage reveals its input, transformation, output, and failure mode. “Control Room” describes the need for visibility and feedback in healthcare GTM systems; it does not make oil-and-gas experience the site's theme.

On desktop, the control room is a horizontal pipeline with a narrow telemetry rail. On mobile, it becomes a vertical tap-through sequence with the same content and no horizontal scrolling. Motion is subtle and deterministic; reduced-motion users receive immediate state changes.

## Visual Direction

The aesthetic is “digital-health data operations room meets GTM systems lab,” not a generic SaaS dashboard.

- Background: warm off-white paper with faint graph-grid and registration marks.
- Primary ink: near-black navy.
- Healthcare signal color: cyan/teal.
- Warning and failure color: safety orange.
- Success color: restrained chartreuse used sparingly.
- Typography: a characterful editorial serif for claims and a compact mono face for telemetry, labels, and build logs. Fonts are bundled locally to avoid third-party requests and layout shifts.
- Components use squared corners, hairline rules, stamped metadata, and numbered stages. Cards are used only when they communicate containment.
- Decorative effects are CSS-based and lightweight. There is no autoplay video, WebGL, parallax, custom cursor, or heavy animation library.

## Information Architecture

The site is a single-page portfolio with deep-linkable case-study sections:

1. **Hero / operating thesis**
   - Headline: “Healthcare GTM problems are usually data problems first.”
   - Supporting line: Ryan builds the signals, models, integrations, and automation that turn fragmented healthcare data into action.
   - Primary action: enter the Control Room.
   - Secondary actions: view LinkedIn and contact Ryan by email.

2. **GTM Control Room**
   - Interactive closed-loop system.
   - Tabs: Tables, Signals, Function, Workflows.
   - Sanitized telemetry displays source scale, processing stages, status, and aggregate outputs.

3. **Selected systems**
   - Three case studies with distinct scope and depth.
   - Each includes context, architecture, build log, evidence, failure log, and reflective script.

4. **System registry**
   - Compact inventory of portfolio-safe Clay assets: five active signals, one errored signal, one custom function, and two non-empty workflows.
   - Campaigns are described as an activation layer not yet shipped in this workspace. No campaign metrics are implied.

5. **Career through-line**
   - A short narrative centered on startup and digital-health data platforms, lifecycle systems, and the move into GTM engineering.
   - Two years of oil-and-gas data consulting appear only as an early automation proof point, not a featured chapter.
   - This section is not a chronological resume and does not enumerate every employer bullet.

6. **Contact / next system**
   - Email and LinkedIn links.
   - Invitation framed around healthcare GTM data systems.
   - Phone number is not published.

## Case Studies

### 1. Multi-Signal Account Engine

Problem: A static construction account list could not distinguish durable fit from timely reasons to engage.

System:

- Source: 60 large U.S. companies across construction and adjacent industrial categories.
- Normalize company identity and domain.
- Detect new-hire, job-posting, and company-topic-intent events.
- Add qualitative field feedback from Tally.
- Join BLS industry injury-rate data.
- Convert individual dimensions to reusable tiers with the custom AutoTier function.
- Combine signals into a composite score and write results downstream.

Evidence:

- 60 scored accounts.
- 27 captured new-hire events in the related event table.
- Final score tiers: 11 high, 40 medium, 9 low.
- Intent tiers: 9 high, 37 medium, 7 low, 7 without a tier.
- Injury-rate tiers: 20 high, 12 medium, 28 low.
- In a ten-row health sample, one AutoTier intent action errored while the other sampled scoring and write stages succeeded. This is explicitly a sample, not a workspace-wide error rate.

Failure and reflection: Scoring systems need explicit missing-data behavior and observability. A tiering failure can silently distort prioritization even when the surrounding pipeline is green. The case study will show how Ryan would make the failure contract, retry behavior, and null handling more explicit in a production revision.

### 2. Healthcare Market Map

Problem: Healthcare targeting is an entity-resolution problem before it is an outreach problem. Facility, parent organization, health-system, ownership, capacity, insurance, and revenue attributes live in separate datasets with inconsistent identifiers.

System:

- Import 5,419 CMS facility records from an HTTP source.
- Look up health-system and corporate-parent identity.
- Send matched records into a 922-row health-system working layer.
- Join against a 639-record CHSP health-system dataset containing system size, beds, discharges, ownership, insurance-product, physician, facility, and revenue measures.
- Derive scale, geography, facility, fit, executive-density, role-density, and total scores.
- Enrich company identity, create a match key, detect duplicates, retain the best company row, and segment the result.

Evidence:

- 5,419 CMS facility rows at ingestion.
- 639 CHSP health-system records available for matching.
- 922 rows in the integrated Turquoise Health Systems layer.
- Output segments: 139 mature targets, 196 immature targets, and 167 payer-provider organizations.
- In a ten-row CMS sample, two rows lacked a health-system lookup and therefore also lacked the downstream send step. These counts are indicative sample health, not global match-rate claims.

Failure and reflection: Public healthcare data is rich but relationally messy. Missing parent identifiers, duplicate company matches, and facility-to-system ambiguity must be first-class states. The case study will explain why the “Is Best Row” and maximum-score-per-company logic matter and why table row counts must not be presented as funnel conversion rates.

### 3. Activation Workflows

Problem: A scored account is not useful until it can be routed into repeatable research and activation with safe missing-data handling.

System A — Turquoise Immature:

- Start from an audience segment.
- Check for a usable company identifier.
- Route missing identifiers to an explicit marked state.
- Otherwise find contacts and save them to Clay Audiences.

System B — Turquoise Operator Enrichment:

- Start from an audience segment.
- Research public professional activity.
- Draft a personalized LinkedIn message in the context of healthcare pricing, payer contracting, and reimbursement.
- Save the research and message back to the audience record.

Evidence: The first workflow contains five nodes with an explicit conditional branch; the second contains four nodes in a linear research-to-writing-to-persistence flow.

Failure and reflection: The missing-identifier branch is a deliberate product decision, not an exception to hide. Campaign execution is not represented as complete: the Clay workspace currently contains no Campaigns, so the case study stops at prepared activation output.

## Clay System Registry

The static site contains a sanitized build-time snapshot derived from read-only Clay CLI calls.

Included:

- Signal names, types, active/error status, cadence label, and generalized input kind.
- Aggregate event-table counts used by a case study.
- AutoTier's human-readable contract: scoring value + company domain + scoring dimension → tier.
- Workflow names, node names/types, and edges for Turquoise Immature and Turquoise Operator Enrichment.
- Table names, stage-level row counts, selected column names, aggregate tier distributions, and sampled health summaries.

Excluded:

- Contact names, email addresses, phone numbers, LinkedIn profiles, row-level company data, prompts containing personal information, internal IDs, authentication material, and raw API responses.
- The empty untitled workflow.
- Direct public links into private Clay workspace objects.

The initial release uses a committed sanitized snapshot. A local sync script can refresh it from an authenticated Clay CLI session and must validate the output against an allowlist before writing. GitHub Pages never receives Clay credentials. Automated GitHub Actions refresh is deferred; if added later, it will require a Clay credential stored as a GitHub Actions secret and a separate review of Clay's API support for every resource type.

## Resume and Identity Use

The GTM-engineering resume controls public positioning; the data-engineering resume supplies technical depth and factual checks. Resume content is treated as reference data, never page structure.

Career evidence used:

- More than four years building production cloud data platforms, with startup and digital-health experience as the primary career context.
- BetterHelp work spanning Snowflake, dbt, Fivetran, lifecycle marketing, audience segmentation, Iterable, Looker, and operational analytics.
- Cylinder Health work spanning claims, membership, product usage, client billing, reporting, and batch/real-time pipelines in a startup environment.
- Optum/AbleTo healthcare pipelines and data marts supporting millions of members, BI, call-center, marketing, and data-science consumers.
- Reliability practices including data-quality checks, testing, CI/CD, lineage-aware modeling, production troubleshooting, and stakeholder translation.
- Two years of earlier oil-and-gas data consulting, represented by one concise automation example: a multiweek data process reduced to ten minutes.

The public narrative does not use the broader oil-and-gas engineering tenure, $1B+ program scale, 200K+ hours, or ten-month schedule reduction as headline credibility. Those achievements may remain on a full resume, but they distract from the portfolio's digital-health and GTM focus.

Public identity links:

- LinkedIn: https://www.linkedin.com/in/ryan-s-75366514/
- Email: ryansulapas@gmail.com

The site does not publish Ryan's phone number or reproduce the resumes verbatim.

## Technical Architecture

- React with TypeScript and Vite.
- Static build compatible with GitHub Pages.
- No runtime backend and no runtime Clay request in the first release.
- Content stored as typed objects under `src/content/`.
- Sanitized Clay snapshot stored under `src/data/` and validated by a schema.
- UI split into small components for navigation, hero, control-room visualization, registry, case-study sections, metrics, build logs, failure notes, and contact.
- Deep links use stable section IDs and hash navigation; no client router is required.
- Fonts are bundled locally. Icons are inline SVG components. Screenshots are portfolio-safe diagrams and anonymized table/system views derived from observed structures, not raw Clay screenshots containing record data.
- Vite's GitHub Pages base path is configured from the repository name.

## Data Flow

1. An authenticated developer runs the local Clay sync script.
2. The script executes only read-only allowlisted CLI commands.
3. A sanitizer converts responses into aggregate metrics and named topology without row values or internal identifiers.
4. A schema check rejects unknown fields and malformed counts.
5. The generated JSON becomes an application build input.
6. React renders the Control Room, registry, and case-study metrics from that snapshot.
7. GitHub Actions builds the static application and publishes `dist/` to GitHub Pages.

The checked-in snapshot makes deployment reproducible even when Clay is unavailable.

## Interaction Details

- Control Room stage buttons are real buttons with pressed/selected states.
- Selecting a source highlights only the affected downstream path and updates a text explanation in an `aria-live="polite"` region.
- Keyboard users can traverse stages in document order and activate them with standard controls.
- Case-study build logs use progressive disclosure with accessible `details` elements or controlled buttons.
- Metric charts have adjacent textual values and never encode meaning by color alone.
- Navigation remains small and avoids a mobile hamburger unless content density proves it necessary.
- Motion uses opacity and transform only, stays under 350 ms for interaction feedback, and is disabled under `prefers-reduced-motion`.

## Error Handling and Truthfulness

- If the sanitized snapshot is unavailable at build time, the app renders authored case-study content and hides dynamic registry counts rather than failing the page.
- Snapshot validation fails the local sync command before unsafe or unexpected data can be written.
- Unknown registry asset types render as a neutral “unsupported snapshot type” only in development and are excluded from production output.
- All sample-derived health statements are labeled as samples.
- Stage row counts are never described as conversion rates or unique-entity counts unless the source establishes that fact.
- The site explicitly distinguishes observed metrics, interpretation, and proposed production improvements.

## Performance Budget

- Initial JavaScript target: under 150 kB compressed, excluding locally bundled font files.
- No heavy charting, animation, routing, or component-library dependency.
- Images use SVG/CSS where practical; raster assets use AVIF or WebP with explicit dimensions.
- Below-the-fold raster media is lazy-loaded.
- Fonts are subset or limited to the weights actually used.
- Long case-study sections use `content-visibility: auto` where supported.
- Target Lighthouse scores on the production build: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

## Testing and Verification

- Unit tests for snapshot sanitization, aggregate formatting, and project-content validation.
- Component tests for Control Room selection, keyboard operation, fallback rendering, and case-study disclosure.
- Automated checks for accessible names and critical ARIA state.
- TypeScript type-check, lint, unit tests, and production build run before completion.
- Browser checks at 320 px, 390 px, 768 px, and desktop widths.
- Reduced-motion, keyboard-only, forced-colors/high-contrast, broken-link, and missing-data checks. A separate dark theme is outside the first-release scope.
- Production GitHub Pages URL verified after deployment.

## Repository and Deployment

The local project directory becomes a Git repository. The intended GitHub repository name is `gtmweb`, matching the existing workspace folder. A GitHub Actions workflow builds on pushes to the default branch and deploys through GitHub Pages.

Remote repository creation and publication occur only after local implementation and verification. If `gtmweb` is unavailable in Ryan's GitHub account, the fallback name is `gtm-control-room`; the Vite base path and deployment URL must match the actual repository name.

## Definition of Done

The project is complete when:

- The approved content and interactions are implemented without exposing private Clay data.
- All automated checks and the production build pass.
- Mobile, keyboard, and reduced-motion behavior are manually verified.
- The repository exists on GitHub with source history and an active Pages deployment.
- The public URL loads successfully and is shared with Ryan.
- Adding a future project is documented in the repository README.
