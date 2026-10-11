# AI suggestions and code fixing

The working tree on `Janu-development` includes the existing UI/session/analysis integration from `origin/feature/backend-integration#1`, followed by the AI additions. The original detailed Pull Requests analysis sections and findings filters remain available. The old static demo pages/components are superseded by that approved integration.

AI Code Fixing is now an active sidebar entry at `/developer/ai-fixing`. The Pull Requests analysis page adds an independent AI suggestions card and a link that carries the selected repository and PR. Both pages retain the existing indigo sidebar, rounded white cards and finding-table styling.

Copy `.env.example` to `.env.local` and configure the main backend URL, AI service URL, and shared internal token locally. `AI_SUGGESTIONS_URL` and `INTERNAL_SERVICE_TOKEN` are server-only; never give them a `NEXT_PUBLIC_` prefix. Existing user session bearer tokens are forwarded through `/api/ai-suggestions/*` and verified by AI-Suggestions against the main backend. The legacy OAuth callback no longer logs access tokens.

Use **Generate AI suggestions** to load explanations and debt context. In AI Code Fixing, select one or more findings and use **Fix selected**. Review the patch, run **Validate patch**, then **Create fix pull request**. A created PR waits for review. Same-repository fixes can use **Review merge confirmation** and its separate Confirm merge action. For a fork-originated PR, install the same GitHub App on the fork with Contents and Pull requests write access; the service creates a draft fix PR inside the fork, and it must be reviewed and merged on GitHub to update the original upstream PR. No merge action exists on the normal Pull Requests analysis page.

The service blocks stale commits, failed validation, missing tests/dependencies, unauthorized repositories and protected fix targets. A manager/admin must authorize a merge, and GitHub protection must permit it. No automatic merge occurs.

Jobs can be restored during the browser session. In-progress and completed duplicate requests return their existing job; resubmitting a failed generation retries it, and the fixing page also exposes an explicit **Retry job** action. Service-unavailable and authorization errors remain inside the AI card and do not remove existing analysis.

Before live use, complete the AI service's database mapping, credentials and validator-image setup described in its README. The technical-debt schema is still required. UI/unit tests use fixtures and do not verify a live organization merge.

Run `npm.cmd run lint`, `npm.cmd test -- --maxWorkers=2`, and `npm.cmd run build`. The build's existing Google Fonts imports require network access. Use Node 22.22.2+ to satisfy the installed jsdom engine requirement.
