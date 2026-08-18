const cards = [
  {
    title: "Active Projects",
    value: "8",
    change: "+2",
    description: "this month",
    icon: "📁",
  },
  {
    title: "Overall Progress",
    value: "76%",
    change: "+8%",
    description: "from last month",
    icon: "📈",
  },
  {
    title: "Team Members",
    value: "32",
    change: "+4",
    description: "active members",
    icon: "👥",
  },
  {
    title: "Critical Issues",
    value: "7",
    change: "-3",
    description: "from last week",
    icon: "⚠️",
  },
  {
    title: "Upcoming Deadlines",
    value: "4",
    change: "2",
    description: "this week",
    icon: "📅",
  },
  {
    title: "Project Health",
    value: "92%",
    change: "+5%",
    description: "overall health",
    icon: "💚",
  },
];

export default function ManagerDashboardCards() {
  return (
    <div className="grid grid-cols-2 gap-5 xl:grid-cols-6">

      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >

          <div className="flex items-center justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4338CA]/10 text-xl">
              {card.icon}
            </div>

          </div>

          <p className="mt-4 text-sm font-medium text-gray-500">
            {card.title}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-gray-800">
            {card.value}
          </h2>

          <p className="mt-2 text-xs">

            <span className="font-semibold text-green-600">
              {card.change}
            </span>{" "}

            <span className="text-gray-400">
              {card.description}
            </span>

          </p>

        </div>
      ))}

    </div>
  );
}