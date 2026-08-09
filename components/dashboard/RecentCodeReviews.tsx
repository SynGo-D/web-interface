"use client";

import { codeReviews } from "./DashboardData";

export default function RecentCodeReviews() {

  return (

    <div className="rounded-2xl bg-white p-6 shadow">

      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Recent Code Reviews
      </h2>

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="pb-3 text-left">File</th>

            <th className="pb-3 text-left">Issues</th>

            <th className="pb-3 text-left">Debt</th>

            <th className="pb-3 text-left">Severity</th>

          </tr>

        </thead>

        <tbody>

          {codeReviews.map((review) => (

            <tr
              key={review.file}
              className="border-b hover:bg-gray-50"
            >

              <td className="py-4 font-medium">
                {review.file}
              </td>

              <td>{review.issues}</td>

              <td>{review.debt}</td>

              <td>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  {review.severity}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}