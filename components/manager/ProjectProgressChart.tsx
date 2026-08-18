"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    week: "Week 1",
    progress: 35,
  },
  {
    week: "Week 2",
    progress: 45,
  },
  {
    week: "Week 3",
    progress: 52,
  },
  {
    week: "Week 4",
    progress: 61,
  },
  {
    week: "Week 5",
    progress: 68,
  },
  {
    week: "Week 6",
    progress: 76,
  },
];

export default function ProjectProgressChart() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-lg font-bold text-gray-800">
          Project Progress
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Overall project completion
        </p>

      </div>

      <div className="h-[280px]">

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>

            <defs>
              <linearGradient
                id="progressGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="5%"
                  stopColor="#4338CA"
                  stopOpacity={0.3}
                />

                <stop
                  offset="95%"
                  stopColor="#4338CA"
                  stopOpacity={0}
                />

              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              formatter={(value) => [`${value}%`, "Progress"]}
            />

            <Area
              type="monotone"
              dataKey="progress"
              stroke="#4338CA"
              strokeWidth={3}
              fill="url(#progressGradient)"
            />

          </AreaChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}