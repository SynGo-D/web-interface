"use client";

import { useState } from "react";

export default function RepositoryForm() {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [branch, setBranch] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log({
      repositoryUrl,
      branch,
    });

    // Later connect this with backend API
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {/* Repository URL */}
      <div>
        <label
          htmlFor="repository"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Repository URL
        </label>

        <input
          id="repository"
          type="url"
          placeholder="https://github.com/user/project"
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none transition caret-[#4338CA] focus:border-[#4338CA]"
          required
        />
      </div>

      {/* Branch */}
      <div>
        <label
          htmlFor="branch"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Branch
        </label>

        <input
          id="branch"
          type="text"
          placeholder="main"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none transition caret-[#4338CA] focus:border-[#4338CA]"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-[#4338CA] py-3 font-semibold text-white transition hover:opacity-90"
      >
        Connect Repository
      </button>
    </form>
  );
}
