# Home Estimator

A responsive React + TypeScript + Tailwind app for rapidly analyzing homes, estimating missing ownership costs, and seeing true monthly out-of-pocket cost after roommate income.

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

## Notes

- Zip code is used to infer state-level property tax and insurance averages.
- If square footage is omitted, utility estimates fall back to a beds-based approximation.
- Utilities, taxes, insurance, PMI/MIP, and maintenance reserve can all be switched from auto-estimate to manual values.
