"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

import { debtData } from "./DashboardData";

export default function TechnicalDebtChart() {
  const currentDebt = debtData[debtData.length - 1].debt;
  const previousDebt = debtData[debtData.length - 2].debt;
  const reduction = previousDebt - currentDebt;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Technical Debt
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Technical debt trend over the last 7 months
          </p>
        </div>

        <div className="rounded-xl bg-indigo-50 px-4 py-2 text-right">
          <p className="text-xs text-gray-500">
            Current
          </p>

          <p className="text-xl font-bold text-[#4338CA]">
            {currentDebt} hrs
          </p>
        </div>

      </div>

      {/* Improvement indicator */}
      <div className="mb-5 flex items-center gap-2">

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          ↓ {reduction} hrs
        </span>

        <span className="text-sm text-gray-500">
          Improved from last month
        </span>

      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={debtData}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >

          <defs>
            <linearGradient
              id="debtGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#4338CA"
                stopOpacity={0.25}
              />

              <stop
                offset="100%"
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
            tick={{
              fill: "#6B7280",
              fontSize: 12,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#6B7280",
              fontSize: 12,
            }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [`${value} hrs`, "Technical Debt"]}
          />

          <Area
            type="monotone"
            dataKey="debt"
            stroke="#4338CA"
            strokeWidth={3}
            fill="url(#debtGradient)"
            dot={{
              r: 4,
              fill: "#4338CA",
              strokeWidth: 2,
              stroke: "#FFFFFF",
            }}
            activeDot={{
              r: 7,
            }}
          />

        </AreaChart>
      </ResponsiveContainer>

    </div>
  );
}