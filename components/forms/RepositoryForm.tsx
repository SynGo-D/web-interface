"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RepositoryForm() {
  const router = useRouter();
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/repository", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repositoryUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to connect repository.");
        return;
      }

      router.push(
        `/repository-details?repo=${encodeURIComponent(repositoryUrl)}`
      );

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Repository URL
          </label>

          <input
            type="url"
            placeholder="https://github.com/user/project"
            value={repositoryUrl}
            onChange={(e)=>setRepositoryUrl(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-black"
            required
          />
        </div>


        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#4338CA] py-3 text-white"
        >
          {loading ? "Connecting..." : "Connect Repository"}
        </button>

      </form>
    </div>
  );
}