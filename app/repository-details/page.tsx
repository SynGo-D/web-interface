"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Repository {
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  visibility: string;
  created: string;
  updated: string;
  url: string;
}

export default function RepositoryDetailsPage() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo");

  const [repository, setRepository] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!repoUrl) return;

    const fetchRepository = async () => {
      try {
        const response = await fetch("/api/repository", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repositoryUrl: repoUrl,
          }),
        });

        const data = await response.json();
        setRepository(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [repoUrl]);

  if (loading) {
    return <p className="p-10">Loading repository...</p>;
  }

  if (!repository) {
    return <p className="p-10">Repository not found.</p>;
  }

  return (
    <div className="flex min-h-screen justify-center bg-[#4338CA]">
        <main className="mx-auto max-w-5xl p-8">
            <h1  className="text-3xl font-bold text-gray-200 mb-6">Repository Details</h1>

            <div className="rounded-xl border bg-white p-10 shadow text-gray-600">
                <div>
                <h2 className="text-2xl font-bold">{repository.name}</h2> 
                <hr className="mt-4 border-gray-400" />
                </div>
                

                <p className="mt-2">
                Owner: <strong>{repository.owner}</strong>
                </p>

                <p className="mt-2">{repository.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                    <strong>Language:</strong> {repository.language || "N/A"}
                </div>

                <div>
                    <strong>Visibility:</strong> {repository.visibility}
                </div>

                <div>
                    <strong>Stars:</strong> {repository.stars}
                </div>

                <div>
                    <strong>Forks:</strong> {repository.forks}
                </div>
                </div>

                <button
                className="mt-8 rounded-lg bg-[#4338CA] px-6 py-3 font-semibold text-white transition hover:opacity-90"
                >
                Authorize Repository
                </button>
            </div>
        </main>
    </div>  
  );
}