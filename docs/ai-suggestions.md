# AI code suggestions

The working tree on `Janu-development` includes the existing UI/session/analysis integration from `origin/feature/backend-integration#1`, followed by the AI additions. The original detailed Pull Requests analysis sections and findings filters remain available. The old static demo pages/components are superseded by that approved integration.

AI Code Suggestion is an active sidebar entry at `/developer/ai-fixing`. The Pull Requests analysis page also includes an AI suggestions card and a link that carries the selected repository and PR. Both pages retain the existing indigo sidebar and rounded white cards.

Copy `.env.example` to `.env.local` and configure the main backend URL, AI service URL, and shared internal token locally. `AI_SUGGESTIONS_URL` and `INTERNAL_SERVICE_TOKEN` are server-only; never give them a `NEXT_PUBLIC_` prefix. Existing user session bearer tokens are forwarded through `/api/ai-suggestions/*` and verified by AI-Suggestions against the main backend. The legacy OAuth callback no longer logs access tokens.

Use **Generate AI suggestions** to load explanations, technical-debt impact, and recommended corrections for all current findings. The frontend does not select findings, generate patches, validate changes, create pull requests, or merge code.

The service still verifies the signed-in user's repository access and requires the selected analysis to match the pull request's current commit. No source code is changed by the frontend workflow.

Suggestion jobs can be restored during the browser session. In-progress and completed duplicate requests return their existing job, and failed suggestion generation exposes a **Retry suggestions** action. Service-unavailable and authorization errors remain inside the AI card and do not remove existing analysis.

Before live use, complete the AI service's analysis and technical-debt database mapping and its model/GitHub credentials. UI/unit tests use fixtures and do not verify a live provider request.

Run `npm.cmd run lint`, `npm.cmd test -- --maxWorkers=2`, and `npm.cmd run build`. The build's existing Google Fonts imports require network access. Use Node 22.22.2+ to satisfy the installed jsdom engine requirement.
