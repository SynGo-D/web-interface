"use client";

import { useState } from "react";
import {
  GitBranch,
  GitPullRequest,
  Search,
} from "lucide-react";

const repositories = [
  "E-Commerce Platform",
  "Hospital Management System",
  "University Library System",
];

const pullRequests = [
  {
    id: "#142",
    title: "Add user authentication",
    author: "John Smith",
    branch: "feature/authentication",
  },
  {
    id: "#139",
    title: "Fix payment calculation",
    author: "Sarah Wilson",
    branch: "fix/payment-calculation",
  },
  {
    id: "#136",
    title: "Improve database queries",
    author: "David Brown",
    branch: "feature/database-optimization",
  },
];

export default function PullRequestSelector() {
  const [repository, setRepository] = useState(
    repositories[0]
  );

  const [selectedPR, setSelectedPR] = useState(
    pullRequests[0].id
  );

  return (
    <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-lg font-bold text-gray-800">
          Select Pull Request
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select a repository and Pull Request to view its analysis.
        </p>

      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        {/* Repository */}
        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Repository
          </label>

          <div className="relative">

            <GitBranch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/10"
            >

              {repositories.map((repo) => (
                <option key={repo} value={repo}>
                  {repo}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* Pull Request */}
        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Pull Request
          </label>

          <div className="relative">

            <GitPullRequest
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={selectedPR}
              onChange={(e) => setSelectedPR(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/10"
            >

              {pullRequests.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.id} — {pr.title}
                </option>
              ))}

            </select>

          </div>

        </div>

      </div>

      {/* Selected PR */}
      <div className="mt-5 flex flex-col justify-between gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center">

        <div>

          <div className="flex items-center gap-2">

            <span className="rounded-md bg-[#4338CA]/10 px-2 py-1 text-xs font-bold text-[#4338CA]">
              {selectedPR}
            </span>

            <h3 className="font-semibold text-gray-800">
              {pullRequests.find(
                (pr) => pr.id === selectedPR
              )?.title}
            </h3>

          </div>

          <p className="mt-2 text-xs text-gray-500">
            Branch:{" "}
            <span className="font-medium">
              {
                pullRequests.find(
                  (pr) => pr.id === selectedPR
                )?.branch
              }
            </span>
          </p>

        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#4338CA] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >

          <Search size={17} />

          View Analysis

        </button>

      </div>

    </div>
  );
}