const projects = [
  {
    name: "E-Commerce Platform",
    progress: 84,
    status: "On Track",
  },
  {
    name: "Hospital Management",
    progress: 72,
    status: "On Track",
  },
  {
    name: "Banking System",
    progress: 58,
    status: "At Risk",
  },
  {
    name: "Mobile Application",
    progress: 91,
    status: "On Track",
  },
];

export default function ProjectStatus() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-lg font-bold text-gray-800">
          Project Status
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Current progress of your projects
        </p>

      </div>

      <div className="space-y-5">

        {projects.map((project) => (
          <div key={project.name}>

            <div className="flex items-center justify-between">

              <p className="text-sm font-semibold text-gray-800">
                {project.name}
              </p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  project.status === "On Track"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {project.status}
              </span>

            </div>

            <div className="mt-2 flex items-center gap-3">

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-[#4338CA]"
                  style={{
                    width: `${project.progress}%`,
                  }}
                />

              </div>

              <span className="w-10 text-right text-xs font-semibold text-gray-600">
                {project.progress}%
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}