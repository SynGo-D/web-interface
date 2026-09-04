# web-interface

The Next.js frontend for CodePulse (product name in the UI: "CodeLens") —
an automated code-review and technical-debt platform. This app talks to
exactly one backend, `main-backend`, over HTTP; `main-backend` in turn
gateways requests to `integration-service` and `analysis-engine`. This app
never talks to any other service, database, or message broker directly.

```text
Backend  = analysis + calculation + persistence   (analysis-engine, main-backend)
Frontend = presentation + interaction             (this repo)
```

## Analysis dashboard

`/developer/analysis/[owner]/[repo]/[number]` renders the full ESLint
analysis for one pull request — overview metrics, cyclomatic/cognitive
complexity (shown as two distinct metrics, never merged), code size,
unused-code findings, issue density, rule/file statistics, and a
filterable/paginated findings explorer. Every number shown there comes
from `analysis-engine`'s `AnalysisMetrics` (via `main-backend`'s gateway,
see `lib/api.ts`) — this app never recalculates a density, average, or
violation count itself; see `components/analysis/` for the reusable
pieces that render them, and `AnalysisDashboard.tsx` for how they compose.

Reachable from `/developer/dashboard`, which links to each connected
repository's latest analysis.

## Running the backend alone vs. backend + frontend

The backend (`main-backend`, `analysis-engine`, `integration-service`,
`webhook-listener`, Postgres, RabbitMQ) is fully independent of this repo
— it runs, processes PR jobs, and serves its HTTP API with or without
`web-interface` ever being started. Deleting this repo entirely does not
affect it. To run backend-only, follow each of those repos' own READMEs
and skip everything below.

To add this frontend on top of a running backend:

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_MAIN_BACKEND_URL if main-backend isn't on :5000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Full local stack

```text
Terminal 1: each service's own Postgres + the shared RabbitMQ broker (see webhook-listener's and analysis-engine's docker-compose.yml)
Terminal 2: integration-service
Terminal 3: analysis-engine
Terminal 4: main-backend
Terminal 5: web-interface (this repo) — npm run dev, or `docker compose up` (see below)
```

### Docker

```bash
docker compose up --build
```

This starts only `web-interface` (port 3000), as an **optional** service —
see `docker-compose.yml`. It builds against `NEXT_PUBLIC_MAIN_BACKEND_URL`
(defaults to `http://localhost:5000`; override in your shell environment or
a `.env` file next to `docker-compose.yml` if `main-backend` isn't
reachable there, e.g. `http://host.docker.internal:5000` when
`main-backend` runs un-containerized on the host).

## Tests

```bash
npm test
```

Vitest + React Testing Library, with mocked API fixtures under
`tests/fixtures/` — the frontend test suite never needs a running backend.

## Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
