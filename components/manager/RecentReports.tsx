const reports = [
  {
    name: "E-Commerce Project Report",
    date: "Aug 08, 2026",
    type: "Project Report",
  },
  {
    name: "Monthly Technical Debt Report",
    date: "Aug 01, 2026",
    type: "Technical Debt",
  },
  {
    name: "Team Performance Report",
    date: "Jul 30, 2026",
    type: "Team Performance",
  },
];

export default function RecentReports() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5 flex items-center justify-between">

        <div>

          <h2 className="text-lg font-bold text-gray-800">
            Recent Reports
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Recently generated project reports
          </p>

        </div>

        <button className="text-sm font-medium text-[#4338CA] hover:underline">
          View All
        </button>

      </div>

      <div className="space-y-3">

        {reports.map((report) => (
          <div
            key={report.name}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4338CA]/10">
                📄
              </div>

              <div>

                <p className="text-sm font-semibold text-gray-800">
                  {report.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {report.type} • {report.date}
                </p>

              </div>

            </div>

            <button className="text-sm font-medium text-[#4338CA] hover:underline">
              View
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}