"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DebtSummary } from "@/lib/technicalDebtApi";
import { formatDate } from "./debtFormat";

export default function DebtTrendChart({ trend }: { trend: DebtSummary["trend"] }) {

  const chartData = trend.map((point) => ({
    label: `#${point.pull_request_number} · ${point.commit_sha.slice(0, 7)}`,
    date: formatDate(point.created_at),
    health: point.health_score,
    debt: point.total_debt_minutes,
  }));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-lg font-bold text-gray-800">
          Health &amp; Debt Trend
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Every calculated review, oldest to newest
        </p>

      </div>

      {chartData.length < 2 ? (
        <p className="flex h-[280px] items-center justify-center text-sm text-gray-400">
          The trend appears once there are at least two reviews.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>

          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              yAxisId="health"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              yAxisId="debt"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              labelFormatter={(label, payload) =>
                `${label} — ${payload?.[0]?.payload?.date ?? ""}`
              }
              formatter={(value, name) =>
                name === "health"
                  ? [`${value}/100`, "Health score"]
                  : [`${value} min`, "Debt"]
              }
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
            />

            <Line
              yAxisId="health"
              type="monotone"
              dataKey="health"
              stroke="#4338CA"
              strokeWidth={3}
              dot={{ r: 4 }}
            />

            <Line
              yAxisId="debt"
              type="monotone"
              dataKey="debt"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3 }}
            />

          </LineChart>

        </ResponsiveContainer>
      )}

      <div className="mt-4 flex gap-6 text-sm text-gray-600">

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#4338CA]" />
          Health score
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
          Debt (minutes)
        </span>

      </div>

    </div>
  );
}
