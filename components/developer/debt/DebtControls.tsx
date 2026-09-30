"use client";

import { useState } from "react";
import {
  GitBranch,
  GitPullRequest,
  Loader2,
  Play,
} from "lucide-react";

type DebtControlsProps = {
  repositories: string[];
  repository: string;
  calculating: boolean;
  onRepositoryChange: (repository: string) => void;
  onCalculate: (repository: string, pullRequestNumber: number) => void;
};

const REPOSITORY_PATTERN = /^[^/\s]+\/[^/\s]+$/;

// "https://github.com/owner/repo.git" / "github.com/owner/repo/" -> "owner/repo"
function normalizeRepository(value: string): string {
  return value
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "");
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/10";

export default function DebtControls({
  repositories,
  repository,
  calculating,
  onRepositoryChange,
  onCalculate,
}: DebtControlsProps) {

  // Typed text, committed on blur / Enter so every keystroke doesn't refetch.
  const [draftRepository, setDraftRepository] = useState(repository);
  const [pullRequest, setPullRequest] = useState("");

  // Follow repository changes made elsewhere (initial load, a calculation
  // for another repository) without remounting - a remount mid-click would
  // swallow the Calculate click and clear the PR number.
  const [syncedRepository, setSyncedRepository] = useState(repository);
  if (repository !== syncedRepository) {
    setSyncedRepository(repository);
    setDraftRepository(repository);
  }

  const normalizedRepository = normalizeRepository(draftRepository);
  const repositoryValid = REPOSITORY_PATTERN.test(normalizedRepository);
  const pullRequestNumber = Number(pullRequest);
  const pullRequestValid = Number.isInteger(pullRequestNumber) && pullRequestNumber > 0;
  const canCalculate = repositoryValid && pullRequestValid && !calculating;

  // Why the button is disabled, shown under the form.
  const hint = calculating
    ? null
    : !repositoryValid
      ? draftRepository.trim()
        ? "Enter the repository as owner/repository, e.g. SynGo-D/test-repository."
        : "Enter a repository."
      : !pullRequestValid
        ? "Enter the Pull Request number to calculate its debt."
        : null;

  const commitRepository = () => {
    if (normalizedRepository !== draftRepository) {
      setDraftRepository(normalizedRepository);
    }
    if (repositoryValid && normalizedRepository !== repository) {
      onRepositoryChange(normalizedRepository);
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-lg font-bold text-gray-800">
          Repository &amp; Pull Request
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View a repository&apos;s debt, or calculate debt for a Pull Request the analysis engine has already analysed.
        </p>

      </div>

      <form
        className="grid gap-5 lg:grid-cols-[2fr_1fr_auto] lg:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (canCalculate) {
            onCalculate(normalizedRepository, pullRequestNumber);
          }
        }}
      >

        {/* Repository */}
        <div>

          <label
            htmlFor="debt-repository"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Repository
          </label>

          <div className="relative">

            <GitBranch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="debt-repository"
              list="debt-repositories"
              value={draftRepository}
              placeholder="owner/repository"
              onChange={(e) => setDraftRepository(e.target.value)}
              onBlur={commitRepository}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !canCalculate) {
                  e.preventDefault();
                  commitRepository();
                }
              }}
              className={inputClass}
            />

            <datalist id="debt-repositories">
              {repositories.map((repo) => (
                <option key={repo} value={repo} />
              ))}
            </datalist>

          </div>

        </div>

        {/* Pull Request */}
        <div>

          <label
            htmlFor="debt-pull-request"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Pull Request number
          </label>

          <div className="relative">

            <GitPullRequest
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="debt-pull-request"
              type="number"
              min={1}
              value={pullRequest}
              placeholder="e.g. 42"
              onChange={(e) => setPullRequest(e.target.value)}
              className={inputClass}
            />

          </div>

        </div>

        <button
          type="submit"
          disabled={!canCalculate}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#4338CA] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {calculating ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Play size={17} />
          )}

          {calculating ? "Calculating…" : "Calculate Debt"}

        </button>

      </form>

      {hint && (
        <p className="mt-3 text-sm text-gray-500">
          {hint}
        </p>
      )}

    </div>
  );
}
