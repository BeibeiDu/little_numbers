# Little Numbers

A calm, iPad-first maths practice app for children aged 6–8. React, TypeScript, Vite, IndexedDB and a precached PWA. No backend, accounts, analytics, advertising, remote fonts or paid APIs.

## Run locally

Use Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

Open the printed localhost URL. Enter a nickname and pick an avatar; the first ten-question challenge is immediately available. `npm test`, `npm run lint` and `npm run build` run the checks. `npm run preview` serves the production output, including its service worker (offline support is not enabled in the development server).

## GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository's **Settings → Pages**, select **GitHub Actions** as the build source.
3. The included `.github/workflows/deploy.yml` installs the lockfile, lints, tests, builds, and deploys. It takes the base path from `actions/configure-pages`, so both project repositories and root/custom-domain sites work.
4. Open the URL in the workflow's deployment output.

To test a project path locally:

```sh
BASE_PATH=/hector_maths/ npm run build
BASE_PATH=/hector_maths/ npm run preview
```

Open `http://localhost:4173/hector_maths/`. All JS, CSS, icons, manifest and service-worker paths follow the configured base. Navigation is local screen state, so there are no deep-link 404s. The GitHub repository is https://github.com/BeibeiDu/hector_maths and the Pages address is https://beibeidu.github.io/hector_maths/. Pushes to `main` run the deployment workflow.

## Install on iPad / use offline

Open the deployed HTTPS URL in Safari, allow the first load to finish, then **Share → Add to Home Screen**. The service worker precaches the full app and local assets. After installation completes, questions, activities and IndexedDB progress work without a connection. New app versions activate after old app tabs are closed and the app is reopened; an update does not delete the separate IndexedDB store. A real iPad Add to Home Screen/offline smoke test remains necessary before classroom distribution.

## Change the current theme

Use **For parents**, then hold the button for two seconds (Space or Enter also works). Choose the theme and start date, or start a new fortnight today. Dates are inclusive: start plus 13 days. A completed fortnight stays available until a parent changes it. Place Value is the only shipped theme; there is intentionally no automatic switch to unfinished content. Permanent skill records survive theme changes.

## Learning and content

- 16 micro-skills: tens, representations, partitioning, comparison, ordering, ±1, ±10, counting in 2/3/5/10, money, everyday numbers, and flexible hundreds.
- Seeded deterministic question generation; all answers are computed locally. Multiple choice, number input, visual blocks and tap-to-order formats.
- Five variable real-world activity templates. Feedback affects which activity is suggested; it does not count as a correctly answered question.
- Challenges have 10 questions (roughly five minutes), quick practice has 5. No countdown or pressure. Leaving early still saves each answered question.

### Transparent adaptation

`src/logic/mastery.ts` contains the rules. Score = recent accuracy (last ten answers) × an evidence factor reaching 1 after eight attempts. Secure requires at least 80%, ten attempts and three distinct sessions. Four consecutive correct answers at a four-attempt checkpoint raise difficulty; two wrong answers lower it, bounded to levels 1–5. Mistakes immediately receive a worked explanation and related follow-up practice. Higher difficulty expands number ranges; visual block counts stay manageable.

The default ten-question pattern uses seven current-theme slots, two revision slots and one stretch slot. Revision selects among the least recently practised skills; stretch respects prerequisite exposure. Early profiles fall back to current eligible skills. With only one theme, revision also comes from Place Value. Mistake-driven follow-ups override this mix. Five-question sessions prioritise current-theme practice.

## Add a theme

1. Add theme metadata to `src/themes/index.ts` and stable skill definitions to `src/skills/index.ts`. Prerequisite IDs determine unlocking; do not rename existing IDs if you want to preserve progress.
2. Extend `src/logic/questions.ts` with deterministic generators and concise worked explanations. Generators take skill, difficulty and seed, and return a typed `Question`.
3. Add related activity templates in `src/activities/index.ts` and filter them by theme when adding the second theme.
4. Extend backup validation in `src/storage/index.ts` to recognise the new theme metadata. Use a versioned migration when changing persisted record shapes.
5. Add generator correctness, prerequisite selection and backup tests. No screen rewrite is needed for an additional theme, but the Home hero copy/art currently describes Place Value and should become theme metadata for the second theme.

## Local storage and backups

One child profile per browser/origin, stored in IndexedDB database `little-numbers`, store `progress`, key `child`. It includes nickname/avatar, current theme, mastery, attempts, sessions, feedback and settings. Saves are serialised to avoid out-of-order writes. Failures show a persistent message; keep an export if storage is unavailable. Data is never sent by the app. The host receives ordinary page/asset requests, not child progress.

Parent Settings offers JSON export, validated restore with an explicit replacement step, and confirmed reset. Imports have a 10 MB limit and validate version, field types, skill IDs, status, ranges and dates before replacement. Keep backups private: they contain the nickname and practice history. Browser clearing, private browsing, storage eviction or switching origins/devices can lose or separate progress. App deployments preserve it when the origin remains the same. GitHub Pages projects under the same origin share this database; use a separate domain or database name if deploying independent apps there.

## Checks and remaining limits

Automated tests cover all skills at all five levels with 100 seeds each (8,000 generated questions), answer rejection, arithmetic correctness, mastery, selection fallbacks, JSON round-trips, malformed imports and fortnight dates. TypeScript and ESLint are included in the build workflow. Browser checks confirmed onboarding, numeric feedback, reload persistence, generated activities and feedback, iPad portrait and phone layouts, and production loading under `/hector_maths/`. The production app reloaded and generated questions with its preview server stopped, verifying offline caching. The dependency audit reported zero known vulnerabilities.

This is informal practice, not a curriculum assessment. The hold gate discourages accidental entry; it is not authentication. There is one profile per browser, no syncing, no text-to-speech, and no timed challenge. Reading support from a grown-up may help. Device storage is finite; histories are currently retained rather than pruned. Actual iPad installation/offline behaviour and live GitHub Actions deployment require final checks on the target device/repository.
