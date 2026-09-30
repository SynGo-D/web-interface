const deadlines = [
  {
    project: "E-Commerce Platform",
    task: "Sprint 4 Completion",
    date: "Aug 12",
    priority: "High",
  },
  {
    project: "Hospital Management",
    task: "Testing Phase",
    date: "Aug 15",
    priority: "Medium",
  },
  {
    project: "Banking System",
    task: "Security Review",
    date: "Aug 18",
    priority: "High",
  },
  {
    project: "Mobile Application",
    task: "Release Candidate",
    date: "Aug 22",
    priority: "Medium",
  },
];

export default function UpcomingDeadlines() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-lg font-bold text-gray-800">
          Upcoming Deadlines
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Important project milestones
        </p>

      </div>

      <div className="space-y-4">

        {deadlines.map((deadline) => (
          <div
            key={`${deadline.project}-${deadline.task}`}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
          >

            <div>

              <p className="text-sm font-semibold text-gray-800">
                {deadline.task}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {deadline.project}
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm font-semibold text-gray-700">
                {deadline.date}
              </p>

              <span
                className={`text-xs font-medium ${
                  deadline.priority === "High"
                    ? "text-red-500"
                    : "text-yellow-600"
                }`}
              >
                {deadline.priority}
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}