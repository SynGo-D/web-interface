"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Active",
    value: 18,
  },
  {
    name: "Completed",
    value: 10,
  },
  {
    name: "On Hold",
    value: 5,
  },
  {
    name: "Archived",
    value: 3,
  },
];

const COLORS = [
  "#4338CA",
  "#6366F1",
  "#818CF8",
  "#A5B4FC",
];

export default function ProjectStatusChart() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Project Status
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Current status of all projects
        </p>
      </div>

      <div className="h-[280px]">

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={55}
              paddingAngle={3}
            >

              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

      </div>

      <div className="grid grid-cols-2 gap-3">

        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center gap-2 text-sm"
          >

            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: COLORS[index],
              }}
            />

            <span className="text-gray-600">
              {item.name}
            </span>

            <span className="ml-auto font-semibold text-gray-800">
              {item.value}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}