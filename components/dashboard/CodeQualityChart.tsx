"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

import { qualityData } from "./DashboardData";

export default function CodeQualityChart() {

  const average =
    qualityData.reduce((sum, item) => sum + item.score, 0) /
    qualityData.length;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Code Quality
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Quality score across your projects
          </p>
        </div>

        <div className="rounded-xl bg-indigo-50 px-4 py-2 text-right">

          <p className="text-xs text-gray-500">
            Average
          </p>

          <p className="text-xl font-bold text-[#4338CA]">
            {average.toFixed(0)}%
          </p>

        </div>

      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>

        <BarChart
          data={qualityData}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />

          <XAxis
            dataKey="project"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#6B7280",
              fontSize: 12,
            }}
          />

          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#6B7280",
              fontSize: 12,
            }}
          />

          <Tooltip
            cursor={{ fill: "#F3F4F6" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [`${value}%`, "Quality"]}
          />

          <Bar
            dataKey="score"
            radius={[8, 8, 0, 0]}
            barSize={35}
          >

            {qualityData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.score >= 95
                    ? "#4338CA"
                    : entry.score >= 90
                    ? "#6366F1"
                    : "#A5B4FC"
                }
              />
            ))}

          </Bar>

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}