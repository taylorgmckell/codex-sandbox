# Home Estimator

A responsive React + TypeScript + Tailwind app for rapidly analyzing homes, estimating missing ownership costs, and seeing true monthly out-of-pocket cost after roommate income.

## Project map

Use this as a quick guide when you are changing behavior or tracing a bug.

- `src/App.tsx`
  The main screen. It owns app state, connects inputs to the estimate engine, and renders all major panels.
- `src/lib/estimates.ts`
  The business logic. Mortgage math, PMI logic, auto-estimates, closing cash, roommate income adjustments, and amortization data all start here.
- `src/lib/format.ts`
  Shared helpers for currency, percent, and numeric clamping.
- `src/data/geo.ts`
  ZIP-to-state inference and state-level tax and insurance assumptions.
- `src/types.ts`
  Shared TypeScript contracts for inputs, roommates, estimates, and chart data.
- `src/components/`
  Reusable UI pieces. Charts, form controls, layout cards, and the roommate editor live here.
- `src/index.css`
  Global styles, font import, and slider styling.
- `src/main.tsx`
  React entry point that mounts the app.
- `vite.config.ts`
  Vite config for local development and GitHub Pages base-path handling.
- `.github/workflows/deploy-home-estimator.yml`
  GitHub Pages deployment workflow.

## Features

- Mortgage principal + interest using standard amortization
- Monthly ownership cost including taxes, insurance, PMI/MIP, HOA, utilities, and maintenance reserve
- Dynamic roommate income offsets with vacancy stress testing
- Estimated cash to close
- Manual override support for all major auto-estimated costs
- Monthly breakdown donut chart and amortization chart
- Mobile-friendly responsive layout for fast house comparison

## Run locally

1. Open a terminal in `C:\GitHub\codex-sandbox\home-estimator`
2. Install dependencies:
   `npm install`
3. Start the dev server:
   `npm run dev`
4. Open the local URL shown by Vite

## Build

`npm run build`

## Developer workflow

- For UI layout or state wiring changes, start in `src/App.tsx` and the matching component under `src/components/`.
- For calculation changes, start in `src/lib/estimates.ts`.
- For formatting changes, use `src/lib/format.ts`.
- For location-based assumption changes, edit `src/data/geo.ts`.
- After changes, run `npm run build` to catch TypeScript and Vite issues before pushing.

## GitHub Pages

This repo is configured to deploy the app to GitHub Pages from GitHub Actions.

Expected site URL:

`https://taylorgmckell.github.io/codex-sandbox/`

To publish:

1. Push the repo to the `main` branch on GitHub
2. In the GitHub repo, open `Settings > Pages`
3. Set the source to `GitHub Actions` if it is not already selected
4. Wait for the `Deploy Home Estimator` workflow to finish

## Notes

- Zip code is used to infer state-level property tax and insurance averages.
- If square footage is omitted, utility estimates fall back to a beds-based approximation.
- Utilities, taxes, insurance, PMI/MIP, and maintenance reserve can all be switched from auto-estimate to manual values.

## Commenting note

Purpose comments were added to the top of source and config files where the file format allows comments. JSON files such as `package.json`, `package-lock.json`, and the `tsconfig` files cannot safely contain comments.
