const users = [
  {
    name: "John Smith",
    email: "john@example.com",
    role: "Senior Developer",
    status: "Active",
  },
  {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "Project Manager",
    status: "Active",
  },
  {
    name: "David Brown",
    email: "david@example.com",
    role: "Senior Developer",
    status: "Active",
  },
  {
    name: "Emily Davis",
    email: "emily@example.com",
    role: "Project Manager",
    status: "Inactive",
  },
];

export default function RecentUsers() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Recent Users
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Recently registered users
          </p>
        </div>

        <button className="text-sm font-medium text-[#4338CA] hover:underline">
          View All
        </button>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead>
            <tr className="border-b text-xs uppercase text-gray-400">

              <th className="pb-3">
                User
              </th>

              <th className="pb-3">
                Role
              </th>

              <th className="pb-3">
                Status
              </th>

            </tr>
          </thead>

          <tbody>

            {users.map((user) => (
              <tr
                key={user.email}
                className="border-b last:border-0"
              >

                <td className="py-4">

                  <p className="text-sm font-semibold text-gray-800">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {user.email}
                  </p>

                </td>

                <td className="py-4 text-sm text-gray-600">
                  {user.role}
                </td>

                <td className="py-4">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {user.status}
                  </span>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}