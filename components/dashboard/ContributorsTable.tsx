"use client";

import { contributors } from "./DashboardData";

export default function ContributorsTable() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Top Contributors
      </h2>

      <div className="space-y-5">

        {contributors.map((user) => (

          <div
            key={user.id}
            className="flex items-center justify-between rounded-xl border p-4 hover:bg-gray-50 transition"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4338CA] text-xl font-bold text-white">
                {user.name.charAt(0)}
              </div>

              <div>

                <h3 className="font-semibold text-gray-800">
                  {user.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {user.role}
                </p>

                <p className="mt-1 text-sm text-[#4338CA]">
                  {user.expertise}
                </p>

              </div>

            </div>

            <div className="text-right">

              <p className="font-semibold text-gray-800">
                {user.commits} Commits
              </p>

              <p className="text-sm text-gray-500">
                {user.prs} Pull Requests
              </p>

              <span className="inline-block rounded-full bg-green-100 px-3 py-1 mt-2 text-xs font-semibold text-green-700">
                {user.quality}
              </span>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}