"use client";

import { useRouter } from "next/navigation";

export default function AuthorizationSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#4338CA]">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-xl text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <span className="text-5xl text-green-600">✓</span>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Authorization Successful
        </h1>

        <p className="mt-4 text-gray-600">
          Your GitHub repository has been successfully authorized.
        </p>

        <p className="mt-2 text-gray-600">
          You can now start analyzing pull requests and tracking technical debt.
        </p>

        <button
          onClick={() => router.push("/developer/dashboard")}
          className="mt-8 rounded-lg bg-[#4338CA] px-8 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Go to Dashboard
        </button>

      </div>
    </div>
  );
}