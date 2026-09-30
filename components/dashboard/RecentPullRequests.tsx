"use client";

import { pullRequests } from "./DashboardData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RecentPullRequests() {
  const badge = (status: string) => {
    if (status === "Merged") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Open") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">

        <div>
          <h2 className="text-base font-bold text-gray-800">
            Recent Pull Requests
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Latest repository pull requests
          </p>
        </div>

        <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-[#4338CA]">
          {pullRequests.length} Recent
        </span>

      </div>


      {/* Table */}
      <div className="overflow-x-auto">

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead className="w-[80px]">
                PR
              </TableHead>

              <TableHead>
                Pull Request
              </TableHead>

              <TableHead>
                Author
              </TableHead>

              <TableHead>
                Status
              </TableHead>

            </TableRow>

          </TableHeader>


          <TableBody>

            {pullRequests.map((pr) => (

              <TableRow key={pr.id}>

                {/* PR ID */}
                <TableCell className="font-semibold text-[#4338CA]">
                  {pr.id}
                </TableCell>


                {/* Title */}
                <TableCell>

                  <div>

                    <p className="max-w-[220px] truncate text-sm font-medium text-gray-800">
                      {pr.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {pr.repository}
                    </p>

                  </div>

                </TableCell>


                {/* Author */}
                <TableCell>

                  <span className="text-sm text-gray-600">
                    {pr.author}
                  </span>

                </TableCell>


                {/* Status */}
                <TableCell>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge(
                      pr.status
                    )}`}
                  >
                    {pr.status}
                  </span>

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </div>


      {/* Footer */}
      <div className="mt-4 border-t border-gray-100 pt-3">

        <button
          className="text-xs font-semibold text-[#4338CA] hover:underline"
          onClick={() => console.log("View all pull requests")}
        >
          View all pull requests →
        </button>

      </div>

    </div>
  );
}