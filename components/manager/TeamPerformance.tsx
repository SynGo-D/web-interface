const developers = [
  {
    name: "John Smith",
    role: "Backend Developer",
    progress: 92,
    issues: 2,
  },
  {
    name: "Sarah Wilson",
    role: "Frontend Developer",
    progress: 87,
    issues: 3,
  },
  {
    name: "David Brown",
    role: "Full Stack Developer",
    progress: 81,
    issues: 4,
  },
  {
    name: "Emily Davis",
    role: "Mobile Developer",
    progress: 76,
    issues: 5,
  },
];

export default function TeamPerformance() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-lg font-bold text-gray-800">
          Team Performance
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Overall contribution and progress
        </p>

      </div>

      <div className="space-y-5">

        {developers.map((developer) => (
          <div key={developer.name}>

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-gray-800">
                  {developer.name}
                </p>

                <p className="text-xs text-gray-400">
                  {developer.role}
                </p>

              </div>

              <div className="text-right">

                <p className="text-sm font-semibold text-gray-800">
                  {developer.progress}%
                </p>

                <p className="text-xs text-gray-400">
                  {developer.issues} issues
                </p>

              </div>

            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-[#4338CA]"
                style={{
                  width: `${developer.progress}%`,
                }}
              />

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}