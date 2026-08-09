const projects = [
  {
    name: "E-Commerce Platform",
    manager: "Sarah Wilson",
    developers: 8,
    status: "Active",
  },
  {
    name: "Hospital Management",
    manager: "John Smith",
    developers: 5,
    status: "Active",
  },
  {
    name: "Banking System",
    manager: "David Brown",
    developers: 12,
    status: "Completed",
  },
  {
    name: "Mobile Application",
    manager: "Emily Davis",
    developers: 6,
    status: "On Hold",
  },
];

export default function RecentProjects() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Recent Projects
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest projects in the system
          </p>
        </div>

        <button className="text-sm font-medium text-[#4338CA] hover:underline">
          View All
        </button>

      </div>

      <div className="space-y-4">

        {projects.map((project) => (
          <div
            key={project.name}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
          >

            <div>

              <h3 className="text-sm font-semibold text-gray-800">
                {project.name}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Manager: {project.manager}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {project.developers} developers
              </p>

            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                project.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : project.status === "Completed"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {project.status}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}