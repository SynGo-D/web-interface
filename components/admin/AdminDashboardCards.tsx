const cards = [
  {
    title: "Total Users",
    value: "248",
    change: "+12%",
    description: "from last month",
    icon: "👥",
  },
  {
    title: "Active Projects",
    value: "36",
    change: "+8%",
    description: "from last month",
    icon: "📁",
  },
  {
    title: "Repositories",
    value: "74",
    change: "+15%",
    description: "from last month",
    icon: "🔗",
  },
  {
    title: "Total Analyses",
    value: "1,284",
    change: "+21%",
    description: "from last month",
    icon: "📊",
  },
  {
    title: "Critical Issues",
    value: "18",
    change: "-6%",
    description: "from last month",
    icon: "⚠️",
  },
  {
    title: "System Health",
    value: "99.8%",
    change: "+0.3%",
    description: "from last month",
    icon: "💚",
  },
];

export default function AdminDashboardCards() {
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