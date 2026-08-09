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
  { month: "Jan", analyses: 120 },
  { month: "Feb", analyses: 180 },
  { month: "Mar", analyses: 150 },
  { month: "Apr", analyses: 240 },
  { month: "May", analyses: 310 },
  { month: "Jun", analyses: 280 },
  { month: "Jul", analyses: 390 },
  { month: "Aug", analyses: 450 },
];

export default function SystemActivityChart() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-800">
          System Activity
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Number of repository analyses performed
        </p>
      </div>

      <div className="h-[280px]">

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>

            <defs>
              <linearGradient
                id="analysisGradient"
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
              dataKey="month"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="analyses"
              stroke="#4338CA"
              strokeWidth={3}
              fill="url(#analysisGradient)"
            />

          </AreaChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}