"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    month: "Mar",
    debt: 420,
  },
  {
    month: "Apr",
    debt: 390,
  },
  {
    month: "May",
    debt: 350,
  },
  {
    month: "Jun",
    debt: 310,
  },
  {
    month: "Jul",
    debt: 275,
  },
  {
    month: "Aug",
    debt: 240,
  },
];

export default function TechnicalDebtTrend() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-lg font-bold text-gray-800">
          Technical Debt Trend
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Overall technical debt across projects
        </p>

      </div>

      <div className="h-[280px]">

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(value) => [
                `${value} hrs`,
                "Technical Debt",
              ]}
            />

            <Line
              type="monotone"
              dataKey="debt"
              stroke="#4338CA"
              strokeWidth={3}
              dot={{
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

      <div className="mt-3 rounded-lg bg-green-50 px-4 py-3">

        <p className="text-sm font-medium text-green-700">
          ↓ Technical debt has decreased by 43%
        </p>

        <p className="mt-1 text-xs text-green-600">
          Overall project quality is improving.
        </p>

      </div>

    </div>
  );
}